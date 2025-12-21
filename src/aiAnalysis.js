// Service d'analyse IA avec Hugging Face
// Utilise l'API Inference gratuite de Hugging Face

const HUGGING_FACE_API = 'https://api-inference.huggingface.co/models/facebook/bart-large-mnli';

export async function analyzeThemes(contributions) {
  if (!contributions || contributions.length === 0) {
    return { themes: [], error: 'Aucune contribution à analyser' };
  }

  try {
    // Extraire tous les textes
    const texts = contributions.map(c => c.text).join('. ');
    
    // Liste de thèmes potentiels à détecter (adaptés aux rêves, besoins et inquiétudes)
    const candidateLabels = [
      'environnement',
      'climat',
      'pollution',
      'énergie', 
      'santé',
      'éducation',
      'avenir',
      'travail',
      'emploi',
      'famille',
      'logement',
      'sécurité',
      'violence',
      'technologie',
      'économie',
      'argent',
      'social',
      'relations',
      'justice',
      'liberté',
      'paix',
      'politique'
    ];

    // Analyser chaque contribution individuellement
    const contributionsWithThemes = await Promise.all(
      contributions.map(async (contrib) => {
        try {
          const response = await fetch(HUGGING_FACE_API, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: contrib.text,
              parameters: {
                candidate_labels: candidateLabels,
                multi_label: false
              }
            })
          });

          if (!response.ok) {
            console.warn('Erreur API pour une contribution:', response.status);
            return { ...contrib, aiTheme: 'non classé', aiScore: 0 };
          }

          const result = await response.json();
          
          // Récupérer le thème principal (score le plus élevé)
          const topTheme = result.labels?.[0] || 'non classé';
          const topScore = result.scores?.[0] || 0;

          return {
            ...contrib,
            aiTheme: topTheme,
            aiScore: topScore
          };
        } catch (error) {
          console.warn('Erreur analyse contribution:', error);
          return { ...contrib, aiTheme: 'non classé', aiScore: 0 };
        }
      })
    );

    // Regrouper par thèmes
    const themeGroups = {};
    contributionsWithThemes.forEach(contrib => {
      const theme = contrib.aiTheme;
      if (!themeGroups[theme]) {
        themeGroups[theme] = {
          name: theme,
          contributions: [],
          count: 0,
          avgScore: 0
        };
      }
      themeGroups[theme].contributions.push(contrib);
      themeGroups[theme].count++;
    });

    // Calculer les scores moyens
    Object.values(themeGroups).forEach(group => {
      const totalScore = group.contributions.reduce((sum, c) => sum + c.aiScore, 0);
      group.avgScore = totalScore / group.count;
    });

    // Trier par nombre de contributions
    const themes = Object.values(themeGroups).sort((a, b) => b.count - a.count);

    return {
      themes,
      contributionsWithThemes,
      totalAnalyzed: contributions.length
    };

  } catch (error) {
    console.error('Erreur analyse IA:', error);
    return { 
      themes: [], 
      error: 'Erreur lors de l\'analyse. Réessayez dans quelques instants.' 
    };
  }
}

// Attendre que le modèle soit chargé (peut prendre quelques secondes la première fois)
export async function warmupModel() {
  try {
    await fetch(HUGGING_FACE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: 'test',
        parameters: { candidate_labels: ['test'] }
      })
    });
  } catch (error) {
    console.log('Warmup model:', error);
  }
}
