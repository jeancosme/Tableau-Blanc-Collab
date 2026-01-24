# Configuration des variables d'environnement sur Vercel

## 🔴 Problème actuel
Les données du tableau blanc ne persistent pas après actualisation car **Firebase n'est pas correctement configuré sur Vercel**.

## ✅ Solution : Ajouter les variables d'environnement

### Étape 1 : Accéder à votre projet Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous à votre compte
3. Sélectionnez le projet **Tableau-Blanc-Collab** dans votre dashboard

### Étape 2 : Accéder aux paramètres

1. Une fois dans le projet, cliquez sur l'onglet **Settings** (en haut)
2. Dans le menu de gauche, cliquez sur **Environment Variables**

### Étape 3 : Ajouter les 7 variables Firebase

Pour chaque variable ci-dessous, suivez ces étapes :
- Cliquez sur **Add New**
- Entrez le **Name** (nom de la variable)
- Entrez la **Value** (valeur de la variable)
- Sélectionnez les environnements : **Production**, **Preview** et **Development**
- Cliquez sur **Save**

#### Variables à ajouter :

```
Name: VITE_FIREBASE_API_KEY
Value: AIzaSyB5D8Y8Kq3EtzGjcOML8ysY9fYwEWiRswk
```

```
Name: VITE_FIREBASE_AUTH_DOMAIN
Value: tableau-blanc-57b97.firebaseapp.com
```

```
Name: VITE_FIREBASE_DATABASE_URL
Value: https://tableau-blanc-57b97-default-rtdb.europe-west1.firebasedatabase.app
```

```
Name: VITE_FIREBASE_PROJECT_ID
Value: tableau-blanc-57b97
```

```
Name: VITE_FIREBASE_STORAGE_BUCKET
Value: tableau-blanc-57b97.firebasestorage.app
```

```
Name: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 1083056544550
```

```
Name: VITE_FIREBASE_APP_ID
Value: 1:1083056544550:web:833e6db49d6982872bbfe7
```

### Étape 4 : Redéployer l'application

**Option A : Redéploiement automatique via push Git**
```bash
git add .
git commit -m "Update environment variables"
git push
```

**Option B : Redéploiement manuel depuis Vercel**
1. Allez dans l'onglet **Deployments**
2. Cliquez sur les trois points `...` du dernier déploiement
3. Cliquez sur **Redeploy**
4. Confirmez le redéploiement

### Étape 5 : Vérification

Une fois le déploiement terminé :
1. Ouvrez votre application sur Vercel
2. Ajoutez des post-its
3. Actualisez la page (F5)
4. ✅ Les post-its doivent persister !

## 🔍 Vérifier que Firebase fonctionne

Ouvrez la console du navigateur (F12) et vérifiez :
- ✅ Pas d'erreur Firebase dans la console
- ✅ Les données apparaissent dans Firebase Realtime Database
- ✅ Les post-its persistent après actualisation

## 📊 Vérifier dans Firebase Console

1. Allez sur [console.firebase.google.com](https://console.firebase.google.com)
2. Sélectionnez votre projet **tableau-blanc-57b97**
3. Allez dans **Realtime Database**
4. Vous devriez voir les données synchronisées en temps réel

## ⚠️ Note de sécurité

Les règles de sécurité Firebase sont actuellement en **mode test** (ouvertes à tous). 
Pour la production, configurez des règles plus strictes :

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

À remplacer par des règles sécurisées plus tard si nécessaire.

## 🐛 Dépannage

### Les données ne persistent toujours pas ?

1. Vérifiez que toutes les 7 variables sont bien ajoutées
2. Vérifiez qu'il n'y a pas d'espaces avant/après les valeurs
3. Assurez-vous d'avoir redéployé après l'ajout des variables
4. Vérifiez la console du navigateur pour des erreurs Firebase

### Comment vérifier que les variables sont chargées ?

Ajoutez temporairement ce code dans `firebase.js` :

```javascript
console.log('Firebase Config:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✓' : '✗',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✓' : '✗',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL ? '✓' : '✗',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✓' : '✗'
});
```

Toutes les variables doivent afficher `✓` dans la console.

## 📝 Résumé rapide

```
1. Vercel → Projet → Settings → Environment Variables
2. Ajouter 7 variables VITE_FIREBASE_*
3. Sélectionner Production + Preview + Development
4. Redéployer l'application
5. Tester la persistance
```

C'est tout ! Vos données devraient maintenant persister correctement. 🎉
