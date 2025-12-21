# Lien web

https://jeancosme.github.io/Tableau-Blanc-Collab

# Tableau Blanc Collaboratif

Application web collaborative permettant de créer des sessions de brainstorming avec des post-its virtuels.

## Fonctionnalités

- Créer une session avec une question
- Générer un QR code pour les participants
- Les participants ajoutent des contributions (post-its)
- Affichage en temps réel sur le tableau
- Rafraîchir, effacer ou recommencer une session
- **🆕 Stockage dans un dossier cloud** (OneDrive, Dropbox, Google Drive, etc.)

## Installation

```bash
npm install
```

## Configuration du stockage cloud

### Méthode 1 : Fichier .env (Recommandé)

1. Copiez le fichier `.env.example` en `.env`
2. Modifiez le chemin du dossier de stockage dans `.env`:

```env
STORAGE_PATH=C:\Users\Utilisateur\OneDrive\TableauBlancData
```

### Méthode 2 : Variable d'environnement

```powershell
# PowerShell
$env:STORAGE_PATH="C:\Users\Utilisateur\OneDrive\TableauBlancData"
npm start
```

```bash
# Linux/Mac
STORAGE_PATH="/path/to/cloud/folder" npm start
```

## Utilisation

### Démarrer l'application (tout en un)

```bash
npm start
```

Cette commande démarre automatiquement :
- Le serveur de stockage (port 3001)
- L'interface web (port 5173)

### Démarrer séparément

```bash
# Terminal 1 - Serveur de stockage
npm run server

# Terminal 2 - Interface web
npm run dev
```

## Choix du mode de stockage

Dans `src/main.jsx`, ligne 3 :

```javascript
const USE_CLOUD_STORAGE = true;  // true = dossier cloud, false = localStorage
```

## Dossiers cloud supportés

- **OneDrive**: `C:\Users\Utilisateur\OneDrive\TableauBlancData`
- **Dropbox**: `C:\Users\Utilisateur\Dropbox\TableauBlancData`
- **Google Drive**: `C:\Users\Utilisateur\Google Drive\TableauBlancData`
- **Dossier personnalisé**: N'importe quel dossier de votre choix

Les données seront automatiquement synchronisées entre tous vos appareils via votre service cloud !

## Fichiers de données

- `current-session.json` - Session active
- `contributions-session-XXXXX.json` - Contributions de chaque session

Voir [CLOUD_STORAGE.md](CLOUD_STORAGE.md) pour plus de détails.

