# Script de test de l'endpoint de catégorisation IA (PowerShell)
# Usage: .\test-categorize.ps1 [-Env local|prod]

param(
    [string]$Env = "local"
)

if ($Env -eq "local") {
    $URL = "http://localhost:3000/api/categorize"
    Write-Host "🧪 Test sur environnement LOCAL" -ForegroundColor Cyan
} elseif ($Env -eq "prod") {
    $URL = "https://tableau-blanc-collab.vercel.app/api/categorize"
    Write-Host "🧪 Test sur environnement PRODUCTION" -ForegroundColor Cyan
} else {
    Write-Host "❌ Usage: .\test-categorize.ps1 [-Env local|prod]" -ForegroundColor Red
    exit 1
}

Write-Host "📡 Endpoint: $URL" -ForegroundColor Yellow
Write-Host ""

# Test 1: Cas nominal avec des mots pédagogiques
Write-Host "📝 Test 1: Brainstorming pédagogique (14 mots)" -ForegroundColor Green

$body1 = @{
    sessionId = "test-pedagogie-1"
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

try {
    $response1 = Invoke-RestMethod -Uri $URL -Method Post -Body $body1 -ContentType "application/json"
    $response1 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Test 1 terminé" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 2

# Test 2: Peu de mots (minimum 3)
Write-Host "📝 Test 2: Minimum de mots (3 mots)" -ForegroundColor Green

$body2 = @{
    sessionId = "test-min-words"
    words = @("amour", "respect", "confiance")
    context = "Valeurs de classe"
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri $URL -Method Post -Body $body2 -ContentType "application/json"
    $response2 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Test 2 terminé" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 2

# Test 3: Validation - moins de 3 mots (doit échouer)
Write-Host "📝 Test 3: Validation - trop peu de mots (doit échouer)" -ForegroundColor Yellow

$body3 = @{
    sessionId = "test-invalid"
    words = @("mot1", "mot2")
    context = "Test"
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri $URL -Method Post -Body $body3 -ContentType "application/json"
    $response3 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "⚠️ Erreur attendue: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Test 3 terminé" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 2

# Test 4: Doublons
Write-Host "📝 Test 4: Déduplication de doublons" -ForegroundColor Green

$body4 = @{
    sessionId = "test-duplicates"
    words = @(
        "motivation",
        "Motivation",
        "MOTIVATION",
        "engagement",
        "Engagement",
        "créativité",
        "innovation",
        "innovation",
        "collaboration"
    )
    context = "Test de déduplication"
} | ConvertTo-Json

try {
    $response4 = Invoke-RestMethod -Uri $URL -Method Post -Body $body4 -ContentType "application/json"
    $response4 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Test 4 terminé" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 2

# Test 5: Validation - payload invalide
Write-Host "📝 Test 5: Validation - sessionId manquant (doit échouer)" -ForegroundColor Yellow

$body5 = @{
    words = @("test1", "test2", "test3")
} | ConvertTo-Json

try {
    $response5 = Invoke-RestMethod -Uri $URL -Method Post -Body $body5 -ContentType "application/json"
    $response5 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "⚠️ Erreur attendue: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Test 5 terminé" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 Tous les tests sont terminés !" -ForegroundColor Cyan
