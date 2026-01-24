#!/bin/bash
# Script de test de l'endpoint de catégorisation IA
# Usage: ./test-categorize.sh [local|prod]

ENV=${1:-local}

if [ "$ENV" = "local" ]; then
  URL="http://localhost:3000/api/categorize"
  echo "🧪 Test sur environnement LOCAL"
elif [ "$ENV" = "prod" ]; then
  URL="https://tableau-blanc-collab.vercel.app/api/categorize"
  echo "🧪 Test sur environnement PRODUCTION"
else
  echo "❌ Usage: ./test-categorize.sh [local|prod]"
  exit 1
fi

echo "📡 Endpoint: $URL"
echo ""

# Test 1: Cas nominal avec des mots pédagogiques
echo "📝 Test 1: Brainstorming pédagogique (14 mots)"
curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-pedagogie-1",
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

echo ""
echo "✅ Test 1 terminé"
echo ""
sleep 2

# Test 2: Peu de mots (minimum 3)
echo "📝 Test 2: Minimum de mots (3 mots)"
curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-min-words",
    "words": ["amour", "respect", "confiance"],
    "context": "Valeurs de classe"
  }' | jq '.'

echo ""
echo "✅ Test 2 terminé"
echo ""
sleep 2

# Test 3: Validation - moins de 3 mots (doit échouer)
echo "📝 Test 3: Validation - trop peu de mots (doit échouer)"
curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-invalid",
    "words": ["mot1", "mot2"],
    "context": "Test"
  }' | jq '.'

echo ""
echo "✅ Test 3 terminé"
echo ""
sleep 2

# Test 4: Doublons
echo "📝 Test 4: Déduplication de doublons"
curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-duplicates",
    "words": [
      "motivation",
      "Motivation",
      "MOTIVATION",
      "engagement",
      "Engagement",
      "créativité",
      "innovation",
      "innovation",
      "collaboration"
    ],
    "context": "Test de déduplication"
  }' | jq '.'

echo ""
echo "✅ Test 4 terminé"
echo ""
sleep 2

# Test 5: Validation - payload invalide
echo "📝 Test 5: Validation - sessionId manquant (doit échouer)"
curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{
    "words": ["test1", "test2", "test3"]
  }' | jq '.'

echo ""
echo "✅ Test 5 terminé"
echo ""

echo "🎉 Tous les tests sont terminés !"
