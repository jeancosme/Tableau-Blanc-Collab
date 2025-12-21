# Guide de configuration Firebase

## Étape 1 : Créer un projet Firebase

1. Allez sur https://console.firebase.google.com/
2. Cliquez sur "Ajouter un projet"
3. Nom du projet : `tableau-blanc-collab`
4. Désactivez Google Analytics (pas nécessaire)
5. Cliquez sur "Créer le projet"

## Étape 2 : Configurer Realtime Database

1. Dans le menu de gauche, cliquez sur **"Realtime Database"**
2. Cliquez sur **"Créer une base de données"**
3. Choisissez la région (ex: `europe-west1`)
4. **Mode de sécurité** : Choisissez "Commencer en mode test" (pour commencer)
5. Cliquez sur "Activer"

## Étape 3 : Obtenir les clés de configuration

1. Cliquez sur l'icône engrenage ⚙️ en haut à gauche
2. Cliquez sur **"Paramètres du projet"**
3. Faites défiler jusqu'à **"Vos applications"**
4. Cliquez sur l'icône **`</>`** (Web)
5. Nom de l'application : `tableau-blanc-web`
6. Cliquez sur "Enregistrer l'application"
7. **Copiez** les valeurs de `firebaseConfig`

## Étape 4 : Configurer dans GitHub

### Via le site GitHub (Recommandé)

1. Allez dans votre repo : https://github.com/jeancosme/Tableau-Blanc-Collab
2. Cliquez sur **Settings**
3. Dans le menu de gauche, cliquez sur **Secrets and variables** > **Actions**
4. Cliquez sur **New repository secret** et ajoutez chaque clé :

| Nom du secret | Valeur |
|---------------|--------|
| `VITE_FIREBASE_API_KEY` | Votre `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Votre `authDomain` |
| `VITE_FIREBASE_DATABASE_URL` | Votre `databaseURL` |
| `VITE_FIREBASE_PROJECT_ID` | Votre `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Votre `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Votre `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | Votre `appId` |

## Étape 5 : Modifier le workflow pour utiliser les secrets

Le workflow GitHub Actions a été mis à jour pour utiliser ces secrets automatiquement.

## Étape 6 : Déployer

Une fois les secrets configurés, poussez le code :

```powershell
git add .
git commit -m "Intégration Firebase pour sync temps réel"
git push origin main
```

Le déploiement se fera automatiquement avec les clés Firebase !

## Règles de sécurité (À configurer après les tests)

Dans Firebase Console > Realtime Database > Règles, remplacez par :

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Pour plus de sécurité en production, vous pouvez restreindre l'accès plus tard.

## Fonctionnement

Une fois configuré :
- ✅ Les contributions apparaîtront **instantanément** sur tous les appareils
- ✅ Pas besoin de rafraîchir la page
- ✅ Synchronisation en temps réel
- ✅ Fonctionne sur PC, mobile, tablette

## Support

En cas de problème, vérifiez :
1. Que tous les secrets sont bien configurés dans GitHub
2. Que la Realtime Database est bien activée
3. Les logs dans l'onglet Actions de GitHub
