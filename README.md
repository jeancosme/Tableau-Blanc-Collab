# Tableau Blanc Collaboratif

Application web collaborative permettant de créer des sessions de brainstorming avec des post-its virtuels.

## Installation

```bash
npm install
```

## Développement local

```bash
npm run dev
```

## Déploiement sur Vercel

1. Installer Vercel CLI :
```bash
npm install -g vercel
```

2. Se connecter à Vercel :
```bash
vercel login
```

3. Déployer :
```bash
vercel
```

Pour un déploiement en production :
```bash
vercel --prod
```

## Fonctionnalités

- Créer une session avec une question
- Générer un QR code pour les participants
- Les participants ajoutent des contributions (post-its)
- Affichage en temps réel sur le tableau
- Rafraîchir, effacer ou recommencer une session
