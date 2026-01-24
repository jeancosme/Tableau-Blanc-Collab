/**
 * K-means clustering implementation
 */

/**
 * Normalise un mot (trim, lowercase, collapse spaces)
 */
export function normalizeWord(word) {
  return word.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Déduplique les mots en conservant le mapping vers les index originaux
 */
export function deduplicateWords(words) {
  const normalized = words.map(normalizeWord);
  const uniqueMap = new Map(); // normalized -> { text: original, indices: [] }
  
  words.forEach((word, idx) => {
    const norm = normalized[idx];
    if (!uniqueMap.has(norm)) {
      uniqueMap.set(norm, { text: word, indices: [idx] });
    } else {
      uniqueMap.get(norm).indices.push(idx);
    }
  });

  return Array.from(uniqueMap.values());
}

/**
 * Calcule la distance euclidienne entre deux vecteurs
 */
function euclideanDistance(a, b) {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

/**
 * Calcule le centroïde d'un groupe de vecteurs
 */
function calculateCentroid(vectors) {
  if (vectors.length === 0) return null;
  
  const dim = vectors[0].length;
  const centroid = new Array(dim).fill(0);
  
  for (const vector of vectors) {
    for (let i = 0; i < dim; i++) {
      centroid[i] += vector[i];
    }
  }
  
  for (let i = 0; i < dim; i++) {
    centroid[i] /= vectors.length;
  }
  
  return centroid;
}

/**
 * Détermine le nombre optimal de clusters
 */
export function determineK(n) {
  const k = Math.round(Math.sqrt(n));
  return Math.max(3, Math.min(k, 6));
}

/**
 * K-means clustering
 * @param {number[][]} embeddings - Vecteurs d'embeddings
 * @param {number} k - Nombre de clusters
 * @param {number} maxIterations - Maximum d'itérations
 * @returns {number[]} - Index du cluster pour chaque embedding
 */
export function kMeansClustering(embeddings, k, maxIterations = 50) {
  const n = embeddings.length;
  
  // Cas spéciaux
  if (n <= k) {
    return embeddings.map((_, idx) => idx);
  }

  // Initialisation: k-means++ pour de meilleurs centroïdes initiaux
  const centroids = [];
  const usedIndices = new Set();
  
  // Premier centroïde aléatoire
  const firstIdx = Math.floor(Math.random() * n);
  centroids.push([...embeddings[firstIdx]]);
  usedIndices.add(firstIdx);
  
  // Sélectionner les k-1 centroïdes suivants
  for (let c = 1; c < k; c++) {
    const distances = embeddings.map((emb, idx) => {
      if (usedIndices.has(idx)) return 0;
      const minDist = Math.min(...centroids.map(cent => euclideanDistance(emb, cent)));
      return minDist ** 2;
    });
    
    const sum = distances.reduce((a, b) => a + b, 0);
    let random = Math.random() * sum;
    
    for (let i = 0; i < n; i++) {
      random -= distances[i];
      if (random <= 0 && !usedIndices.has(i)) {
        centroids.push([...embeddings[i]]);
        usedIndices.add(i);
        break;
      }
    }
  }
  
  let assignments = new Array(n).fill(0);
  let changed = true;
  let iterations = 0;
  
  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;
    
    // Assignation: chaque point au centroïde le plus proche
    for (let i = 0; i < n; i++) {
      let minDist = Infinity;
      let bestCluster = 0;
      
      for (let c = 0; c < k; c++) {
        const dist = euclideanDistance(embeddings[i], centroids[c]);
        if (dist < minDist) {
          minDist = dist;
          bestCluster = c;
        }
      }
      
      if (assignments[i] !== bestCluster) {
        assignments[i] = bestCluster;
        changed = true;
      }
    }
    
    // Recalculer les centroïdes
    for (let c = 0; c < k; c++) {
      const clusterPoints = embeddings.filter((_, idx) => assignments[idx] === c);
      if (clusterPoints.length > 0) {
        centroids[c] = calculateCentroid(clusterPoints);
      }
    }
  }
  
  return assignments;
}

/**
 * Regroupe les mots dédupliqués en clusters
 * @param {Array} uniqueWords - Résultat de deduplicateWords
 * @param {number[]} assignments - Assignations des clusters
 * @returns {Array} - Clusters avec items
 */
export function groupWordsByClusters(uniqueWords, assignments) {
  const clusters = {};
  
  uniqueWords.forEach((wordData, idx) => {
    const clusterId = assignments[idx];
    if (!clusters[clusterId]) {
      clusters[clusterId] = [];
    }
    
    // Ajouter tous les indices originaux (en cas de doublons)
    wordData.indices.forEach(sourceIndex => {
      clusters[clusterId].push({
        text: wordData.text,
        sourceIndex: sourceIndex
      });
    });
  });
  
  // Convertir en array et trier par taille décroissante
  return Object.entries(clusters)
    .map(([clusterId, items]) => ({
      clusterId: parseInt(clusterId),
      items: items
    }))
    .sort((a, b) => b.items.length - a.items.length);
}
