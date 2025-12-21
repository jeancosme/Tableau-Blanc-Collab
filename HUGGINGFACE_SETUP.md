# Configuration Hugging Face API

## Obtenir une clé API gratuite

1. Créer un compte sur https://huggingface.co/join
2. Aller sur https://huggingface.co/settings/tokens
3. Cliquer sur "New token"
4. Nom : "Tableau-Blanc-Collab"
5. Type : "Read" (suffisant)
6. Copier le token (commence par `hf_...`)

## Ajouter à GitHub Secrets

1. Aller sur https://github.com/jeancosme/Tableau-Blanc-Collab/settings/secrets/actions
2. Cliquer "New repository secret"
3. Nom : `VITE_HUGGINGFACE_API_KEY`
4. Valeur : Coller votre token `hf_...`
5. Sauvegarder

Le prochain déploiement utilisera automatiquement cette clé !
