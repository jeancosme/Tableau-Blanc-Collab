import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Configuration du dossier de stockage
// Modifiez ce chemin pour pointer vers votre dossier cloud
// Exemples:
// - OneDrive: 'C:\\Users\\Utilisateur\\OneDrive\\TableauBlancData'
// - Dropbox: 'C:\\Users\\Utilisateur\\Dropbox\\TableauBlancData'
// - Google Drive: 'C:\\Users\\Utilisateur\\Google Drive\\TableauBlancData'
const STORAGE_PATH = process.env.STORAGE_PATH || path.join(__dirname, 'data');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Créer le dossier de stockage s'il n'existe pas
async function ensureStorageDir() {
  try {
    await fs.access(STORAGE_PATH);
  } catch {
    await fs.mkdir(STORAGE_PATH, { recursive: true });
    console.log(`📁 Dossier de stockage créé: ${STORAGE_PATH}`);
  }
}

// GET - Récupérer une valeur
app.get('/storage/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const filePath = path.join(STORAGE_PATH, `${key}.json`);
    
    const data = await fs.readFile(filePath, 'utf-8');
    res.json({ value: data });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Key not found' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// POST - Enregistrer une valeur
app.post('/storage/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const filePath = path.join(STORAGE_PATH, `${key}.json`);
    
    await fs.writeFile(filePath, value, 'utf-8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Supprimer une valeur
app.delete('/storage/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const filePath = path.join(STORAGE_PATH, `${key}.json`);
    
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.json({ success: true }); // Déjà supprimé
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// GET - Lister toutes les clés (pour debug)
app.get('/storage', async (req, res) => {
  try {
    const files = await fs.readdir(STORAGE_PATH);
    const keys = files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
    res.json({ keys });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Configuration - Obtenir le chemin de stockage actuel
app.get('/config/storage-path', (req, res) => {
  res.json({ path: STORAGE_PATH });
});

// Configuration - Changer le chemin de stockage
app.post('/config/storage-path', async (req, res) => {
  const { path: newPath } = req.body;
  if (!newPath) {
    return res.status(400).json({ error: 'Path is required' });
  }
  
  // Note: Pour changer le chemin, il faut redémarrer le serveur avec la variable d'environnement STORAGE_PATH
  res.json({ 
    message: 'Pour changer le chemin de stockage, redémarrez le serveur avec: STORAGE_PATH="votre_chemin" node server.js',
    currentPath: STORAGE_PATH 
  });
});

// Démarrer le serveur
await ensureStorageDir();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Serveur de stockage démarré !
📍 Port: ${PORT}
📁 Dossier de stockage: ${STORAGE_PATH}
🌐 Accessible sur le réseau local

💡 Pour utiliser un dossier cloud personnalisé:
   Windows (PowerShell): $env:STORAGE_PATH="C:\\Users\\Utilisateur\\OneDrive\\TableauBlancData"; node server.js
   Linux/Mac: STORAGE_PATH="/path/to/cloud/folder" node server.js
  `);
});
