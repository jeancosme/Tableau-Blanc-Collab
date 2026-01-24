# Configuration de l'API Albert pour la catégorisation IA

## 📋 Présentation

Ce projet utilise l'API **Albert** (API d'IA de l'État français) pour catégoriser automatiquement les contributions via :
- **Embeddings** : génération de vecteurs sémantiques avec le modèle `BAAI/bge-m3`
- **Clustering** : regroupement des mots similaires via k-means
- **LLM Chat** : attribution de titres pertinents aux clusters avec `AgentPublic/llama3-instruct-8b`

## 🔑 Obtenir une clé API Albert

1. Rendez-vous sur [https://albert.api.etalab.gouv.fr](https://albert.api.etalab.gouv.fr)
2. Créez un compte ou connectez-vous
3. Accédez à votre tableau de bord
4. Générez une clé API
5. **⚠️ IMPORTANT** : Ne partagez JAMAIS cette clé publiquement (GitHub, Discord, etc.)

## 🚀 Configuration sur Vercel

### Étape 1 : Ajouter la variable d'environnement

1. Connectez-vous à [vercel.com](https://vercel.com)
2. Sélectionnez votre projet **Tableau-Blanc-Collab**
3. Allez dans **Settings** → **Environment Variables**
4. Cliquez sur **Add New**
5. Configurez :
   - **Name** : `ALBERT_API_KEY`
   - **Value** : Votre clé API Albert (ex: `albert_xxxxxxxxxxxxx`)
   - **Environments** : Cochez **Production**, **Preview** et **Development**
6. Cliquez sur **Save**

### Étape 2 : Redéployer

**Option A : Push Git (recommandé)**
```bash
git add .
git commit -m "Add AI categorization feature"
git push
```

**Option B : Redéploiement manuel**
1. Allez dans **Deployments**
2. Cliquez sur les `...` du dernier déploiement
3. Sélectionnez **Redeploy**

## 🧪 Test en local

### Configuration locale

1. Créez un fichier `.env.local` à la racine du projet :
```bash
ALBERT_API_KEY=votre_clé_api_ici
```

2. **⚠️ Vérifiez que `.env.local` est dans `.gitignore`** (ne jamais commit les clés !)

### Démarrer le serveur de développement

```bash
# Installer les dépendances
npm install

# Démarrer Vite (frontend)
npm run dev

# Dans un autre terminal, démarrer Vercel Dev (serverless functions)
vercel dev
```

L'application sera accessible sur `http://localhost:3000` (Vercel Dev) qui proxy le frontend Vite.

### Test de l'endpoint avec curl

```bash
curl -X POST http://localhost:3000/api/categorize \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-1",
    "words": [
      "tablette",
      "ordinateur",
      "iPad",
      "souris",
      "clavier",
      "motivation",
      "engagement",
      "participation",
      "intérêt",
      "créativité",
      "innovation",
      "collaboration",
      "coopération",
      "travail d'\''équipe"
    ],
    "context": "Brainstorming sur les outils pédagogiques numériques"
  }'
```

**Réponse attendue :**
```json
{
  "categories": [
    {
      "id": "c1",
      "title": "Matériel informatique",
      "color": "blue",
      "items": [
        { "text": "tablette", "sourceIndex": 0 },
        { "text": "ordinateur", "sourceIndex": 1 },
        { "text": "iPad", "sourceIndex": 2 },
        { "text": "souris", "sourceIndex": 3 },
        { "text": "clavier", "sourceIndex": 4 }
      ]
    },
    {
      "id": "c2",
      "title": "Implication des élèves",
      "color": "green",
      "items": [
        { "text": "motivation", "sourceIndex": 5 },
        { "text": "engagement", "sourceIndex": 6 },
        { "text": "participation", "sourceIndex": 7 },
        { "text": "intérêt", "sourceIndex": 8 }
      ]
    },
    {
      "id": "c3",
      "title": "Travail collectif",
      "color": "purple",
      "items": [
        { "text": "collaboration", "sourceIndex": 11 },
        { "text": "coopération", "sourceIndex": 12 },
        { "text": "travail d'équipe", "sourceIndex": 13 }
      ]
    }
  ],
  "unassigned": [],
  "meta": {
    "k": 3,
    "embedding_model": "BAAI/bge-m3",
    "original_count": 14,
    "unique_count": 14,
    "processing_time_ms": 2847
  }
}
```

## 📂 Architecture des fichiers

```
/api
  └── categorize.js          # Endpoint serverless Vercel (POST /api/categorize)

/lib
  ├── albert.js              # Wrapper API Albert (embeddings + chat)
  └── clustering.js          # K-means clustering + déduplication

/src
  └── App.jsx                # Frontend avec bouton "Catégoriser (IA)"

/docs
  └── ALBERT_SETUP.md        # Ce fichier
```

## 🔍 Validation et debugging

### Vérifier que la clé API est chargée (local)

Ajoutez temporairement dans `api/categorize.js` :

```javascript
console.log('ALBERT_API_KEY present:', !!process.env.ALBERT_API_KEY);
```

Vous devriez voir `true` dans les logs.

### Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `ALBERT_API_KEY not configured` | Variable d'env manquante | Ajouter la variable sur Vercel + redéployer |
| `Request timeout` | API Albert lente ou indisponible | Augmenter `REQUEST_TIMEOUT` dans `lib/albert.js` |
| `Validation failed` | Moins de 3 mots ou mots invalides | Vérifier que les contributions contiennent au moins 3 mots |
| `Invalid response format` | API Albert a changé | Vérifier le format de réponse dans les logs |
| `JSON parse error` | Le LLM n'a pas retourné du JSON pur | Le code a déjà un fallback sur des noms génériques |

### Logs côté Vercel

1. Allez dans **Deployments** → Dernier déploiement
2. Cliquez sur **View Function Logs**
3. Cherchez les logs de `/api/categorize`

## 🎯 Utilisation dans l'application

1. Ajoutez au moins **3 contributions** via QR code
2. Cliquez sur le bouton **🧠 Catégoriser (IA)** dans la toolbar
3. Patientez quelques secondes (l'icône devient un spinner)
4. Visualisez les catégories générées en colonnes
5. Cliquez sur **Fermer et réinitialiser** pour revenir au board normal

## 📊 Limites et contraintes

- **Minimum** : 3 contributions
- **Maximum** : 200 contributions (configurable dans `api/categorize.js`)
- **Timeout** : 30 secondes par défaut
- **Nombre de clusters** : entre 3 et 6, calculé automatiquement via `k = sqrt(n)`
- **Déduplication** : Les doublons exacts (normalisés) sont fusionnés

## 🔐 Sécurité

✅ **Bonnes pratiques appliquées :**
- Clé API stockée côté serveur uniquement (jamais exposée au navigateur)
- Variables d'environnement utilisées via `process.env`
- Validation stricte des entrées (anti-injection)
- Timeout pour éviter les blocages
- CORS configuré correctement
- Pas de données sensibles loggées

⚠️ **À faire pour la production :**
- [ ] Ajouter un rate limiting (limite de requêtes par IP/session)
- [ ] Mettre en cache les embeddings pour les mots fréquents
- [ ] Ajouter une authentification pour l'endpoint `/api/categorize`
- [ ] Monitorer les coûts d'API Albert
- [ ] Ajouter des métriques (Vercel Analytics)

## 📚 Documentation API Albert

- Site officiel : [https://albert.api.etalab.gouv.fr](https://albert.api.etalab.gouv.fr)
- Modèles disponibles : [https://albert.api.etalab.gouv.fr/models](https://albert.api.etalab.gouv.fr/models)
- Embeddings : [https://albert.api.etalab.gouv.fr/docs/embeddings](https://albert.api.etalab.gouv.fr/docs/embeddings)
- Chat : [https://albert.api.etalab.gouv.fr/docs/chat](https://albert.api.etalab.gouv.fr/docs/chat)

## 🆘 Support

En cas de problème :
1. Vérifiez les logs dans la console du navigateur (F12)
2. Vérifiez les logs Vercel (Deployments → Function Logs)
3. Testez l'endpoint avec curl en local
4. Vérifiez que la clé API Albert est valide et active
5. Consultez le statut de l'API Albert : [https://status.api.etalab.gouv.fr](https://status.api.etalab.gouv.fr)

---

**🎉 C'est prêt !** Vous pouvez maintenant catégoriser vos contributions automatiquement avec l'IA.
