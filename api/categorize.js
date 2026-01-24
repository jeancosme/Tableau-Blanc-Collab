/**
 * Vercel Serverless Function: Categorize words using Albert API
 * Endpoint: POST /api/categorize
 */

import { generateEmbeddings, nameClusters } from '../lib/albert.js';
import {
  deduplicateWords,
  determineK,
  kMeansClustering,
  groupWordsByClusters
} from '../lib/clustering.js';

// Configuration
const MAX_WORDS = 200;
const MIN_WORDS = 3;
const MAX_WORD_LENGTH = 100;

/**
 * Valide l'entrée de la requête
 */
function validateInput(body) {
  const errors = [];

  if (!body.sessionId || typeof body.sessionId !== 'string') {
    errors.push('sessionId is required and must be a string');
  }

  if (!body.words || !Array.isArray(body.words)) {
    errors.push('words is required and must be an array');
  } else {
    if (body.words.length < MIN_WORDS) {
      errors.push(`At least ${MIN_WORDS} words are required`);
    }
    if (body.words.length > MAX_WORDS) {
      errors.push(`Maximum ${MAX_WORDS} words allowed`);
    }

    // Valider chaque mot
    const invalidWords = body.words.filter(
      word => !word || typeof word !== 'string' || word.trim().length === 0
    );
    if (invalidWords.length > 0) {
      errors.push('All words must be non-empty strings');
    }

    const tooLongWords = body.words.filter(
      word => word.length > MAX_WORD_LENGTH
    );
    if (tooLongWords.length > 0) {
      errors.push(`Words must not exceed ${MAX_WORD_LENGTH} characters`);
    }
  }

  if (body.context && typeof body.context !== 'string') {
    errors.push('context must be a string if provided');
  }

  return errors;
}

/**
 * Handler principal
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }

  const startTime = Date.now();

  try {
    // 1. Validation
    const validationErrors = validateInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }

    const { sessionId, words, context } = req.body;

    // 2. Vérifier la clé API
    const apiKey = process.env.ALBERT_API_KEY;
    if (!apiKey) {
      console.error('ALBERT_API_KEY not configured');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Albert API key not configured'
      });
    }

    console.log(`[${sessionId}] Processing ${words.length} words`);

    // 3. Nettoyer et dédupliquer
    const cleanedWords = words.map(w => w.trim()).filter(w => w.length > 0);
    const uniqueWords = deduplicateWords(cleanedWords);
    
    console.log(`[${sessionId}] After deduplication: ${uniqueWords.length} unique words`);

    // Cas particulier: trop peu de mots uniques
    if (uniqueWords.length < MIN_WORDS) {
      return res.status(400).json({
        error: 'Insufficient unique words',
        message: `At least ${MIN_WORDS} unique words are required after deduplication`
      });
    }

    // 4. Générer les embeddings
    const wordsToEmbed = uniqueWords.map(w => w.text);
    let embeddings;
    
    try {
      embeddings = await generateEmbeddings(wordsToEmbed, apiKey);
      console.log(`[${sessionId}] Generated ${embeddings.length} embeddings`);
    } catch (error) {
      console.error(`[${sessionId}] Embedding error:`, error);
      return res.status(500).json({
        error: 'Embedding generation failed',
        message: error.message
      });
    }

    // 5. Déterminer k et faire le clustering
    const k = determineK(uniqueWords.length);
    console.log(`[${sessionId}] Using k=${k} clusters`);

    const assignments = kMeansClustering(embeddings, k);
    const clusteredGroups = groupWordsByClusters(uniqueWords, assignments);

    // 6. Nommer les clusters avec Albert
    let namedClusters;
    try {
      namedClusters = await nameClusters(clusteredGroups, context, apiKey);
      console.log(`[${sessionId}] Named ${namedClusters.length} clusters`);
    } catch (error) {
      console.error(`[${sessionId}] Naming error:`, error);
      // Fallback déjà géré dans nameClusters
      namedClusters = clusteredGroups.map((_, idx) => ({
        groupId: `c${idx + 1}`,
        title: `Groupe ${idx + 1}`,
        color: ['green', 'blue', 'purple', 'orange', 'red', 'gray'][idx % 6]
      }));
    }

    // 7. Construire la réponse
    const categories = clusteredGroups.map((cluster, idx) => {
      const naming = namedClusters[idx] || {
        groupId: `c${idx + 1}`,
        title: `Groupe ${idx + 1}`,
        color: 'gray'
      };

      return {
        id: naming.groupId,
        title: naming.title,
        color: naming.color,
        items: cluster.items
      };
    });

    const response = {
      categories: categories,
      unassigned: [], // Pour l'instant, pas de logique d'unassigned
      meta: {
        k: k,
        embedding_model: 'BAAI/bge-m3',
        original_count: words.length,
        unique_count: uniqueWords.length,
        processing_time_ms: Date.now() - startTime
      }
    };

    console.log(`[${sessionId}] Success in ${response.meta.processing_time_ms}ms`);
    return res.status(200).json(response);

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
}
