# Lien web

https://jeancosme.github.io/Tableau-Blanc-Collab

# Tableau Blanc Collaboratif

Application web collaborative permettant de créer des sessions de brainstorming avec des post-its virtuels.

## ✨ Fonctionnalités

### Collaboration en temps réel
- Créer une session avec une question
- Générer un QR code pour les participants
- Les participants ajoutent des contributions (post-its)
- Affichage en temps réel sur le tableau avec Firebase
- Rafraîchir, effacer ou recommencer une session

### 🧠 Catégorisation IA (NOUVEAU !)
- **Regroupement automatique** des contributions par thème
- **Naming intelligent** via l'API Albert (IA de l'État français)
- **Embeddings sémantiques** avec k-means clustering
- Visualisation en colonnes par catégorie
- Minimum 3 contributions requises

### 🎨 Interface moderne
- Paramètres des catégories personnalisables
- Sélection d'emojis par catégorie
- Filtrage par catégorie
- Zoom et pan sur le tableau
- Design responsive Tailwind CSS

## 🚀 Installation

```bash
npm install
```

## 🔑 Configuration

### Firebase (Stockage temps réel)

Les variables Firebase sont déjà configurées dans le code. Pour GitHub Pages ou Vercel, ajoutez les variables d'environnement :

```
VITE_FIREBASE_API_KEY=AIzaSyB5D8Y8Kq3EtzGjcOML8ysY9fYwEWiRswk
VITE_FIREBASE_AUTH_DOMAIN=tableau-blanc-57b97.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://tableau-blanc-57b97-default-rtdb.europe-west1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=tableau-blanc-57b97
VITE_FIREBASE_STORAGE_BUCKET=tableau-blanc-57b97.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1083056544550
VITE_FIREBASE_APP_ID=1:1083056544550:web:833e6db49d6982872bbfe7
```

Voir [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md) pour plus de détails.

### API Albert (Catégorisation IA)

1. Obtenez une clé API sur [https://albert.api.etalab.gouv.fr](https://albert.api.etalab.gouv.fr)
2. Ajoutez la variable d'environnement :
   - **Vercel** : Settings → Environment Variables → `ALBERT_API_KEY`
   - **Local** : Créez `.env.local` avec `ALBERT_API_KEY=votre_clé`

Voir [docs/ALBERT_SETUP.md](docs/ALBERT_SETUP.md) pour le guide complet.

## 💻 Utilisation

### Démarrer l'application en local (avec fonctions serverless)

```bash
# Option 1 : Avec Vercel Dev (recommandé pour tester les fonctions IA)
vercel dev

# Option 2 : Seulement le frontend (sans catégorisation IA)
npm run dev
```

### Test de l'endpoint IA

```bash
curl -X POST http://localhost:3000/api/categorize \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-1",
    "words": ["innovation", "créativité", "iPad", "tablette", "motivation"],
    "context": "Brainstorming pédagogique"
  }'
```

## 📁 Architecture du projet

```
/api
  └── categorize.js          # Endpoint serverless (catégorisation IA)

/lib
  ├── albert.js              # Wrapper API Albert
  └── clustering.js          # K-means clustering

/src
  ├── App.jsx                # Application principale
  ├── firebase.js            # Configuration Firebase
  └── main.jsx               # Point d'entrée

/docs
  ├── ALBERT_SETUP.md        # Guide API Albert
  ├── FIREBASE_SETUP.md      # Guide Firebase
  └── VERCEL_DEPLOY.md       # Guide déploiement
```

## 🚢 Déploiement

### GitHub Pages (Frontend uniquement)

```bash
git add .
git commit -m "Update"
git push
```

Le déploiement se fait automatiquement via GitHub Actions.

### Vercel (Frontend + Serverless)

1. Connectez votre repo GitHub à Vercel
2. Ajoutez les variables d'environnement (Firebase + Albert)
3. Déployez automatiquement à chaque push

## 🔒 Sécurité

- ✅ Clé API Albert jamais exposée côté client
- ✅ Variables d'environnement pour les secrets
- ✅ `.env.local` dans `.gitignore`
- ✅ Validation stricte des entrées API
- ✅ Timeout sur les requêtes externes
- ✅ CORS configuré

## 📚 Documentation

- [Configuration Firebase](VERCEL_ENV_SETUP.md)
- [Configuration Albert IA](docs/ALBERT_SETUP.md)
- [Déploiement Vercel](VERCEL_DEPLOY.md)

## 🛠️ Technologies

- **Frontend**: React 18 + Vite 5 + Tailwind CSS
- **Icons**: Lucide React
- **Base de données**: Firebase Realtime Database
- **IA**: API Albert (embeddings + LLM)
- **Serverless**: Vercel Functions
- **Déploiement**: GitHub Pages / Vercel

## 🤝 Contribution

Branches:
- `main` : Production stable (GitHub Pages)
- `dev` : Développement et tests

Pour contribuer :
```bash
git checkout dev
# Faites vos modifications
git add .
git commit -m "Description"
git push origin dev
```

## 📝 License

MIT

Les données seront automatiquement synchronisées entre tous vos appareils via votre service cloud !

## Fichiers de données

- `current-session.json` - Session active
- `contributions-session-XXXXX.json` - Contributions de chaque session

Voir [CLOUD_STORAGE.md](CLOUD_STORAGE.md) pour plus de détails.

