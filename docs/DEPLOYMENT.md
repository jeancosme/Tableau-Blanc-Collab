# 🚀 Guide de déploiement complet

## 📋 Récapitulatif des changements

### ✅ Fichiers créés
- `api/categorize.js` - Endpoint serverless pour la catégorisation IA
- `lib/albert.js` - Wrapper API Albert (embeddings + chat)
- `lib/clustering.js` - Implémentation k-means
- `docs/ALBERT_SETUP.md` - Guide configuration Albert
- `docs/TEST_API.md` - Guide de test de l'API
- `.env.local.example` - Template de variables d'environnement
- `test-categorize.sh` - Script de test (Linux/Mac)
- `test-categorize.ps1` - Script de test (Windows)

### 🔧 Fichiers modifiés
- `src/App.jsx` - Ajout du bouton catégorisation + UI colonnes
- `vercel.json` - Configuration des fonctions serverless
- `README.md` - Documentation mise à jour

## 🔑 Configuration requise

### 1. Variables d'environnement Vercel

Ajoutez ces variables dans **Settings → Environment Variables** :

```
ALBERT_API_KEY=votre_clé_api_albert_ici
```

Les variables Firebase sont déjà configurées (voir VERCEL_ENV_SETUP.md).

### 2. Configuration locale

Créez `.env.local` :
```bash
cp .env.local.example .env.local
# Éditez .env.local et ajoutez votre vraie clé Albert
```

## 📦 Installation et test en local

### Étape 1 : Installer les dépendances
```bash
npm install
```

### Étape 2 : Démarrer avec Vercel Dev
```bash
# Démarrer le serveur de développement complet (frontend + serverless)
vercel dev
```

### Étape 3 : Tester l'endpoint
```powershell
# Windows PowerShell
.\test-categorize.ps1 -Env local

# Ou avec curl
curl -X POST http://localhost:3000/api/categorize -H "Content-Type: application/json" -d "{\"sessionId\":\"test-1\",\"words\":[\"innovation\",\"créativité\",\"iPad\",\"tablette\",\"motivation\"],\"context\":\"Brainstorming\"}"
```

### Étape 4 : Tester dans l'interface
1. Ouvrez http://localhost:3000
2. Créez une session avec une question
3. Ajoutez au moins 3 contributions
4. Cliquez sur le bouton 🧠 "Catégoriser (IA)"
5. Vérifiez que les catégories s'affichent en colonnes

## 🚢 Déploiement sur Vercel

### Option A : Push Git (Automatique)

```bash
# Vérifier les changements
git status

# Ajouter tous les fichiers
git add .

# Commit
git commit -m "Add AI categorization with Albert API"

# Push sur la branche dev
git push origin dev
```

Vercel détectera automatiquement le push et déploiera.

### Option B : Via Vercel CLI

```bash
# Déployer directement
vercel

# Ou déployer en production
vercel --prod
```

### Vérifier le déploiement

1. Connectez-vous sur [vercel.com](https://vercel.com)
2. Allez dans votre projet **Tableau-Blanc-Collab**
3. Vérifiez que le dernier déploiement est réussi
4. Testez l'URL de production

## 🧪 Test en production

```powershell
# Windows PowerShell
.\test-categorize.ps1 -Env prod

# Ou avec l'URL de votre déploiement Vercel
curl -X POST https://votre-app.vercel.app/api/categorize \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"prod-test","words":["test1","test2","test3"],"context":"Test production"}'
```

## 🔍 Vérifications post-déploiement

### ✅ Checklist

- [ ] L'application se charge correctement
- [ ] Le bouton 🧠 est visible dans la toolbar
- [ ] Au moins 3 contributions sont ajoutées
- [ ] Clic sur 🧠 affiche un spinner
- [ ] Les catégories s'affichent en colonnes après quelques secondes
- [ ] Le bouton "Fermer et réinitialiser" fonctionne
- [ ] Retour au board normal après fermeture

### 🐛 Debugging

Si ça ne fonctionne pas :

1. **Ouvrez la console du navigateur** (F12)
   - Cherchez les erreurs réseau (onglet Network)
   - Cherchez les erreurs JavaScript (onglet Console)

2. **Vérifiez les logs Vercel**
   - Allez dans Deployments → View Function Logs
   - Cherchez les logs de `/api/categorize`

3. **Vérifiez la clé API**
   - Settings → Environment Variables
   - `ALBERT_API_KEY` doit être définie
   - Redéployez si vous venez de l'ajouter

4. **Testez l'endpoint directement**
   ```bash
   curl -X POST https://votre-app.vercel.app/api/categorize \
     -H "Content-Type: application/json" \
     -d '{"sessionId":"debug","words":["a","b","c"],"context":"test"}'
   ```

## 🔄 Merge dev → main (Production GitHub Pages)

Quand vous êtes satisfait des tests sur dev :

```bash
# Basculer sur main
git checkout main

# Merger dev dans main
git merge dev

# Push vers GitHub (déclenche le déploiement GitHub Pages)
git push origin main

# Retourner sur dev pour continuer le développement
git checkout dev
```

## 📊 Monitoring

### Métriques à surveiller

- **Temps de réponse** : devrait être < 10 secondes
- **Taux d'erreur** : devrait être < 5%
- **Utilisation API Albert** : surveillez vos quotas

### Logs utiles

```javascript
// Côté frontend (Console du navigateur)
console.log('Catégorisation réussie:', result);
console.error('Erreur de catégorisation:', error);

// Côté backend (Vercel Function Logs)
console.log(`[${sessionId}] Processing ${words.length} words`);
console.log(`[${sessionId}] Success in ${processing_time_ms}ms`);
```

## 🎉 Félicitations !

Votre application est maintenant déployée avec la catégorisation IA ! 

Les utilisateurs peuvent :
- Créer des sessions de brainstorming
- Collecter des contributions via QR code
- Catégoriser automatiquement avec l'IA Albert
- Visualiser les résultats en colonnes thématiques

---

**Besoin d'aide ?** Consultez :
- [docs/ALBERT_SETUP.md](ALBERT_SETUP.md) - Configuration Albert
- [docs/TEST_API.md](TEST_API.md) - Tests de l'API
- [VERCEL_ENV_SETUP.md](../VERCEL_ENV_SETUP.md) - Configuration Firebase
