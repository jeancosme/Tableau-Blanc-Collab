// Vercel Serverless Function pour le stockage
import fs from 'fs/promises';
import path from 'path';

// Sur Vercel, on utilise /tmp pour le stockage temporaire
// Note: /tmp est éphémère et se réinitialise entre les déploiements
// Pour une solution permanente, il faudrait utiliser une base de données
const STORAGE_PATH = '/tmp/tableau-blanc-data';

async function ensureStorageDir() {
  try {
    await fs.access(STORAGE_PATH);
  } catch {
    await fs.mkdir(STORAGE_PATH, { recursive: true });
  }
}

export default async function handler(req, res) {
  // Activer CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await ensureStorageDir();

  const { key } = req.query;
  
  try {
    if (req.method === 'GET') {
      if (!key) {
        // Lister toutes les clés
        const files = await fs.readdir(STORAGE_PATH);
        const keys = files
          .filter(f => f.endsWith('.json'))
          .map(f => f.replace('.json', ''));
        return res.status(200).json({ keys });
      }
      
      // Récupérer une valeur
      const filePath = path.join(STORAGE_PATH, `${key}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return res.status(200).json({ value: data });
    }
    
    if (req.method === 'POST') {
      // Enregistrer une valeur
      const { value } = req.body;
      const filePath = path.join(STORAGE_PATH, `${key}.json`);
      await fs.writeFile(filePath, value, 'utf-8');
      return res.status(200).json({ success: true });
    }
    
    if (req.method === 'DELETE') {
      // Supprimer une valeur
      const filePath = path.join(STORAGE_PATH, `${key}.json`);
      await fs.unlink(filePath);
      return res.status(200).json({ success: true });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Key not found' });
    }
    return res.status(500).json({ error: error.message });
  }
}
