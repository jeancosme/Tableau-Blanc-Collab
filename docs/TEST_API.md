# Test rapide de l'endpoint de catégorisation

## 🔍 Prérequis

- Avoir configuré `ALBERT_API_KEY` dans Vercel ou `.env.local`
- Avoir au moins 3 contributions dans une session

## 🧪 Test avec curl (Bash/Linux/Mac)

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
      "travail en équipe"
    ],
    "context": "Brainstorming sur les outils pédagogiques numériques"
  }' | jq '.'
```

## 🧪 Test avec PowerShell (Windows)

```powershell
$body = @{
    sessionId = "test-session-1"
    words = @(
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
        "travail en équipe"
    )
    context = "Brainstorming sur les outils pédagogiques numériques"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/categorize" `
  -Method Post `
  -Body $body `
  -ContentType "application/json"
```

## 📊 Réponse attendue

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
      "title": "Engagement des élèves",
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
      "title": "Créativité pédagogique",
      "color": "purple",
      "items": [
        { "text": "créativité", "sourceIndex": 9 },
        { "text": "innovation", "sourceIndex": 10 }
      ]
    },
    {
      "id": "c4",
      "title": "Travail collaboratif",
      "color": "orange",
      "items": [
        { "text": "collaboration", "sourceIndex": 11 },
        { "text": "coopération", "sourceIndex": 12 },
        { "text": "travail en équipe", "sourceIndex": 13 }
      ]
    }
  ],
  "unassigned": [],
  "meta": {
    "k": 4,
    "embedding_model": "BAAI/bge-m3",
    "original_count": 14,
    "unique_count": 14,
    "processing_time_ms": 2847
  }
}
```

## ⚠️ Erreurs possibles

### 400 Bad Request - Validation failed
```json
{
  "error": "Validation failed",
  "details": ["At least 3 words are required"]
}
```
➡️ Vérifiez que vous avez au moins 3 mots

### 500 Internal Server Error - API key not configured
```json
{
  "error": "Server configuration error",
  "message": "Albert API key not configured"
}
```
➡️ Ajoutez `ALBERT_API_KEY` dans Vercel ou `.env.local`

### 500 Internal Server Error - Embedding generation failed
```json
{
  "error": "Embedding generation failed",
  "message": "Request timeout"
}
```
➡️ L'API Albert est lente ou indisponible, réessayez

## 🚀 Scripts de test automatisés

### Linux/Mac
```bash
chmod +x test-categorize.sh
./test-categorize.sh local    # Test en local
./test-categorize.sh prod     # Test en production
```

### Windows
```powershell
.\test-categorize.ps1 -Env local    # Test en local
.\test-categorize.ps1 -Env prod     # Test en production
```
