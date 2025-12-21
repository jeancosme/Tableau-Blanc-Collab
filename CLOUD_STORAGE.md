# Configuration du dossier de stockage cloud

## Windows (PowerShell)

### OneDrive
```powershell
$env:STORAGE_PATH="C:\Users\Utilisateur\OneDrive\TableauBlancData"
npm run server
```

### Dropbox
```powershell
$env:STORAGE_PATH="C:\Users\Utilisateur\Dropbox\TableauBlancData"
npm run server
```

### Google Drive
```powershell
$env:STORAGE_PATH="C:\Users\Utilisateur\Google Drive\TableauBlancData"
npm run server
```

### Nextcloud
```powershell
$env:STORAGE_PATH="C:\Users\Utilisateur\Desktop\NextCloud\Applications"
npm run server
```

### Dossier personnalisé
```powershell
$env:STORAGE_PATH="C:\Votre\Dossier\Personnalisé"
npm run server
```

## Linux/Mac

```bash
STORAGE_PATH="/path/to/your/cloud/folder" npm run server
```

## Utilisation

1. **Installer les dépendances** (si pas déjà fait):
   ```
   npm install
   ```

2. **Démarrer l'application** (serveur + frontend):
   ```
   npm start
   ```
   
   Ou séparément:
   ```
   npm run server    # Terminal 1
   npm run dev       # Terminal 2
   ```

3. **Avec un dossier cloud personnalisé**:
   ```powershell
   # Terminal 1 - Serveur avec dossier cloud
   $env:STORAGE_PATH="C:\Users\Utilisateur\OneDrive\TableauBlancData"
   npm run server
   
   # Terminal 2 - Frontend
   npm run dev
   ```

## Fonctionnement

- Les données sont stockées sous forme de fichiers JSON dans le dossier spécifié
- Si vous utilisez un dossier OneDrive/Dropbox/Google Drive, les fichiers seront automatiquement synchronisés sur tous vos appareils
- Chaque session et ses contributions sont stockées dans des fichiers séparés

## Fichiers créés

- `current-session.json` - Session active
- `contributions-session-XXXXX.json` - Contributions de chaque session

## Mode de stockage

Dans `src/main.jsx`, vous pouvez changer:
```javascript
const USE_CLOUD_STORAGE = true;  // true = cloud, false = localStorage
```
