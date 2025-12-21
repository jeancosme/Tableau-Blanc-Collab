# Déploiement sur Vercel

## Préparation du projet

Votre projet est maintenant prêt pour Vercel ! Les fichiers suivants ont été créés :
- `vercel.json` : Configuration Vercel
- `api/storage/[key].js` : API serverless pour le stockage
- `api/config/storage-path.js` : Configuration de stockage
- `.env.example` : Variables d'environnement

## Option 1 : Déploiement via le site Vercel (Recommandé)

### 1. Créer un compte Vercel
1. Aller sur https://vercel.com
2. S'inscrire avec GitHub (recommandé)

### 2. Pousser votre code sur GitHub
```powershell
git add .
git commit -m "Prêt pour Vercel"
git push origin main
```

### 3. Importer le projet sur Vercel
1. Cliquer sur "Add New Project"
2. Sélectionner votre repo GitHub "Tableau-Blanc-Collab"
3. Vercel détectera automatiquement Vite
4. Cliquer sur "Deploy"

### 4. Configurer les variables d'environnement (Optionnel)
Dans les settings du projet Vercel :
- Aller dans "Environment Variables"
- Ajouter `VITE_STORAGE_API` avec la valeur `/api/storage` (Vercel utilisera automatiquement l'URL de production)

## Option 2 : Déploiement via CLI Vercel

### 1. Installer Vercel CLI
```powershell
npm install -g vercel
```

### 2. Se connecter
```powershell
vercel login
```

### 3. Déployer
```powershell
vercel
```

Suivre les instructions :
- Set up and deploy? `Y`
- Which scope? (Sélectionner votre compte)
- Link to existing project? `N`
- What's your project's name? `tableau-blanc-collab`
- In which directory is your code located? `./`
- Want to override the settings? `N`

### 4. Déploiement en production
```powershell
vercel --prod
```

## Après le déploiement

Votre application sera accessible à une URL type :
`https://tableau-blanc-collab.vercel.app`

### Accès mobile
1. Ouvrir l'URL sur votre téléphone
2. Le QR code affiché contiendra l'URL Vercel
3. Scanner avec un autre appareil pour rejoindre la session

## Important : Stockage

⚠️ **Note importante** : Vercel utilise un stockage temporaire (`/tmp`). Les données peuvent être perdues entre les déploiements ou après un certain temps d'inactivité.

### Solutions pour un stockage permanent :

1. **Vercel KV** (Recommandé)
   - Base de données Redis gratuite
   - https://vercel.com/docs/storage/vercel-kv

2. **Vercel Postgres**
   - Base de données PostgreSQL
   - https://vercel.com/docs/storage/vercel-postgres

3. **MongoDB Atlas** (Gratuit)
   - Base de données NoSQL
   - https://www.mongodb.com/cloud/atlas

4. **Supabase** (Gratuit)
   - Alternative à Firebase
   - https://supabase.com

## Développement local

Pour tester en local avec la configuration Vercel :
```powershell
# Terminal 1 - API locale (backend)
$env:STORAGE_PATH="C:\Users\Utilisateur\Desktop\NextCloud\Applications"
npm run server

# Terminal 2 - Frontend
npm run dev
```

## Commandes utiles

```powershell
# Voir les logs
vercel logs

# Lister les déploiements
vercel ls

# Supprimer un déploiement
vercel remove [deployment-url]

# Ouvrir le dashboard
vercel
```

## Prochaines étapes

Une fois déployé sur Vercel, vous pourrez :
1. Accéder à votre tableau blanc depuis n'importe où
2. Partager le lien avec vos collaborateurs
3. Utiliser l'application sur mobile et desktop
4. Configurer un domaine personnalisé (optionnel)
