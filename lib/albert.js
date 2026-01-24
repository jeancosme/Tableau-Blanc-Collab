/**
 * Albert API Wrapper
 * Documentation: https://albert.api.etalab.gouv.fr/
 */

const ALBERT_BASE_URL = 'https://albert.api.etalab.gouv.fr/v1';
const ALBERT_EMBEDDING_MODEL = 'BAAI/bge-m3';
const ALBERT_CHAT_MODEL = 'AgentPublic/llama3-instruct-8b'; // Modèle rapide et efficace
const REQUEST_TIMEOUT = 30000; // 30 secondes

/**
 * Crée un fetch avec timeout
 */
function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
}

/**
 * Génère des embeddings pour une liste de mots
 * @param {string[]} words - Liste des mots à embedder
 * @param {string} apiKey - Clé API Albert
 * @returns {Promise<number[][]>} - Matrice d'embeddings
 */
export async function generateEmbeddings(words, apiKey) {
  if (!apiKey) {
    throw new Error('ALBERT_API_KEY is required');
  }

  if (!words || words.length === 0) {
    throw new Error('Words array cannot be empty');
  }

  try {
    const response = await fetchWithTimeout(
      `${ALBERT_BASE_URL}/embeddings`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: ALBERT_EMBEDDING_MODEL,
          input: words
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Albert API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // Format Albert: { data: [{ embedding: [...] }, ...] }
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format from Albert API');
    }

    return data.data.map(item => item.embedding);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}

/**
 * Appelle le modèle chat pour nommer les clusters
 * @param {Array} clusters - Les clusters avec leurs mots
 * @param {string} context - Contexte optionnel de la session
 * @param {string} apiKey - Clé API Albert
 * @returns {Promise<Array>} - Titres et couleurs pour chaque cluster
 */
export async function nameClusters(clusters, context, apiKey) {
  if (!apiKey) {
    throw new Error('ALBERT_API_KEY is required');
  }

  // Préparer le prompt
  const clustersDescription = clusters.map((cluster, idx) => {
    const words = cluster.items.map(item => item.text).join(', ');
    return `Groupe ${idx + 1}: ${words}`;
  }).join('\n');

  const systemPrompt = `Tu es un assistant qui aide les enseignants à organiser les idées d'un brainstorming.
Ta tâche est d'analyser des groupes de mots et de donner un titre court et descriptif à chaque groupe.

Règles strictes:
- Titre: 2 à 4 mots maximum, en français
- Couleur: choisir parmi [green, red, blue, purple, orange, gray]
- Format: JSON strict uniquement
- Ne pas inventer de nouveaux concepts, rester proche des mots fournis`;

  const userPrompt = `Contexte de la session: ${context || 'brainstorming pédagogique'}

Groupes de mots à nommer:
${clustersDescription}

Réponds UNIQUEMENT avec un JSON valide de ce format (sans markdown, sans explication):
{"groups": [{"groupId": "c1", "title": "titre court", "color": "green"}, {"groupId": "c2", "title": "autre titre", "color": "blue"}]}`;

  try {
    const response = await fetchWithTimeout(
      `${ALBERT_BASE_URL}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: ALBERT_CHAT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Albert chat API error:', errorText);
      // Fallback sur des noms génériques
      return clusters.map((_, idx) => ({
        groupId: `c${idx + 1}`,
        title: `Groupe ${idx + 1}`,
        color: ['green', 'blue', 'purple', 'orange', 'red', 'gray'][idx % 6]
      }));
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in Albert response');
    }

    // Extraire le JSON (au cas où il y aurait du texte autour)
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('No JSON found in response, using fallback');
      return clusters.map((_, idx) => ({
        groupId: `c${idx + 1}`,
        title: `Groupe ${idx + 1}`,
        color: ['green', 'blue', 'purple', 'orange', 'red', 'gray'][idx % 6]
      }));
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    if (!parsed.groups || !Array.isArray(parsed.groups)) {
      throw new Error('Invalid groups format');
    }

    // Valider et compléter les couleurs
    return parsed.groups.map((group, idx) => ({
      groupId: group.groupId || `c${idx + 1}`,
      title: group.title || `Groupe ${idx + 1}`,
      color: ['green', 'red', 'blue', 'purple', 'orange', 'gray'].includes(group.color)
        ? group.color
        : ['green', 'blue', 'purple', 'orange', 'red', 'gray'][idx % 6]
    }));

  } catch (error) {
    console.error('Error naming clusters:', error);
    // Fallback sur des noms génériques
    return clusters.map((_, idx) => ({
      groupId: `c${idx + 1}`,
      title: `Groupe ${idx + 1}`,
      color: ['green', 'blue', 'purple', 'orange', 'red', 'gray'][idx % 6]
    }));
  }
}
