import React, { useState, useEffect } from 'react';
import { Plus, Users, Trash2, QrCode, RefreshCw, Sparkles } from 'lucide-react';
import { analyzeThemes } from './aiAnalysis.js';

const App = () => {
  const [view, setView] = useState('setup'); // 'setup', 'board', 'participant', 'ai-analysis'
  const [question, setQuestion] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [contributions, setContributions] = useState([]);
  const [participantText, setParticipantText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [filterCategory, setFilterCategory] = useState('all'); // Filtre actif
  const [presentationMode, setPresentationMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const categories = [
    { name: 'Un rêve', color: '#87CEEB', emoji: '💭' },
    { name: 'Un besoin du quotidien', color: '#90EE90', emoji: '🌱' },
    { name: 'Mes inquiétudes', color: '#FF6B6B', emoji: '⚠️' }
  ];

  const colors = ['#FFE5B4', '#FFB6C1', '#B4E7FF', '#D4FFB4', '#FFD4E5', '#E5D4FF', '#FFFACD'];

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const result = await window.storage.get('current-session');
      if (result) {
        const session = JSON.parse(result.value);
        setSessionId(session.id);
        setQuestion(session.question);
        await loadContributions(session.id);
      }
    } catch (error) {
      console.log('Nouvelle session');
    } finally {
      setLoading(false);
    }
  };

  const loadContributions = async (sid) => {
    try {
      const result = await window.storage.get(`contributions-${sid}`);
      if (result) {
        setContributions(JSON.parse(result.value));
      }
      
      // Écouter les changements en temps réel (si Firebase)
      if (window.storage.listen) {
        window.storage.listen(`contributions-${sid}`, (data) => {
          if (data) {
            setContributions(JSON.parse(data.value));
          }
        });
      }
    } catch (error) {
      setContributions([]);
    }
  };

  const startSession = async () => {
    if (!question.trim()) return;
    
    const newSessionId = 'session-' + Date.now();
    const session = { id: newSessionId, question };
    
    await window.storage.set('current-session', JSON.stringify(session));
    await window.storage.set(`contributions-${newSessionId}`, JSON.stringify([]));
    
    setSessionId(newSessionId);
    setContributions([]);
    setView('board');
  };

  const addContribution = async () => {
    if (!participantText.trim() || !selectedCategory) return;

    // Trouver une position libre sans chevauchement
    const findFreePosition = () => {
      const minDistance = 20; // Distance minimale entre les post-its (en %)
      let attempts = 0;
      const maxAttempts = 50;

      while (attempts < maxAttempts) {
        const x = Math.random() * 70 + 5;
        const y = Math.random() * 70 + 5;

        // Vérifier si cette position est libre
        const tooClose = contributions.some(contrib => {
          const dx = Math.abs(contrib.x - x);
          const dy = Math.abs(contrib.y - y);
          return dx < minDistance && dy < minDistance;
        });

        if (!tooClose) {
          return { x, y };
        }
        attempts++;
      }

      // Si on ne trouve pas de position libre après 50 essais, placer quand même
      return { x: Math.random() * 70 + 5, y: Math.random() * 70 + 5 };
    };

    const position = findFreePosition();

    const newContribution = {
      id: Date.now(),
      text: participantText,
      color: selectedCategory.color,
      category: selectedCategory.name,
      x: position.x,
      y: position.y,
      rotation: Math.random() * 10 - 5
    };

    const updated = [...contributions, newContribution];
    
    // Stocker et synchroniser
    await window.storage.set(`contributions-${sessionId}`, JSON.stringify(updated));
    
    // Mettre à jour l'état local immédiatement
    setContributions(updated);
    setParticipantText('');
    setSelectedCategory(null);
  };

  const refreshBoard = async () => {
    if (sessionId) {
      await loadContributions(sessionId);
    }
  };

  const clearBoard = async () => {
    if (confirm('Voulez-vous vraiment effacer toutes les contributions ?')) {
      await window.storage.set(`contributions-${sessionId}`, JSON.stringify([]));
      setContributions([]);
    }
  };

  const resetSession = async () => {
    if (confirm('Voulez-vous démarrer une nouvelle session ?')) {
      await window.storage.delete('current-session');
      setQuestion('');
      setSessionId('');
      setContributions([]);
      setView('setup');
    }
  };

  const handleMouseDown = (e, contrib) => {
    const rect = e.target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    setDraggingId(contrib.id);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseMove = (e) => {
    if (!draggingId) return;

    const container = document.querySelector('.contributions-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;

    // Limiter aux bordures
    const limitedX = Math.max(0, Math.min(95, x));
    const limitedY = Math.max(0, Math.min(95, y));

    const updated = contributions.map(c =>
      c.id === draggingId ? { ...c, x: limitedX, y: limitedY } : c
    );
    setContributions(updated);
  };

  const handleMouseUp = async () => {
    if (draggingId) {
      // Sauvegarder la nouvelle position
      await window.storage.set(`contributions-${sessionId}`, JSON.stringify(contributions));
      setDraggingId(null);
    }
    setIsPanning(false);
  };

  const handleZoom = (delta) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handlePanStart = (e) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Molette ou Ctrl+Clic
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handlePanMove = (e) => {
    if (isPanning) {
      setPan({ 
        x: e.clientX - panStart.x, 
        y: e.clientY - panStart.y 
      });
    }
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const generateQRCodeUrl = () => {
    const participantUrl = `${window.location.origin}${window.location.pathname}?mode=participant&session=${sessionId}&q=${encodeURIComponent(question)}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(participantUrl)}`;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'participant') {
      const sid = params.get('session');
      const q = params.get('q');
      if (sid && q) {
        setSessionId(sid);
        setQuestion(decodeURIComponent(q));
        loadContributions(sid).then(() => {
          setView('participant');
          setLoading(false);
        });
      } else if (sid) {
        // Fallback si pas de question dans l'URL
        setSessionId(sid);
        loadContributions(sid).then(() => {
          window.storage.get('current-session').then(result => {
            if (result) {
              const session = JSON.parse(result.value);
              setQuestion(session.question);
            }
            setView('participant');
            setLoading(false);
          });
        });
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    );
  }

  // Vue Configuration
  if (view === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Tableau Blanc Collaboratif
          </h1>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Quelle est votre question ?
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ex: Que vous évoque l'IA ?"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
              rows="4"
            />
          </div>
          <button
            onClick={startSession}
            disabled={!question.trim()}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Démarrer la session
          </button>
        </div>
      </div>
    );
  }

  // Vue Participant
  if (view === 'participant') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
          <div className="text-center mb-6">
            <Users className="w-12 h-12 text-teal-600 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {question}
            </h2>
            <p className="text-gray-600">Partagez votre réponse</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Choisissez une catégorie :
            </label>
            <div className="grid grid-cols-1 gap-2 mb-4">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category)}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    selectedCategory?.name === category.name
                      ? 'border-teal-600 bg-teal-50 shadow-md'
                      : 'border-gray-300 hover:border-teal-400'
                  }`}
                  style={{
                    backgroundColor: selectedCategory?.name === category.name ? category.color + '30' : 'white'
                  }}
                >
                  <span className="text-2xl">{category.emoji}</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-800">{category.name}</div>
                  </div>
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: category.color }}
                  ></div>
                </button>
              ))}
            </div>
          </div>
          
          {selectedCategory && (
            <div className="mb-4">
              <textarea
                value={participantText}
                onChange={(e) => setParticipantText(e.target.value)}
                placeholder="Votre contribution..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none resize-none"
                rows="4"
                style={{ borderColor: selectedCategory.color }}
              />
            </div>
          )}
          
          <button
            onClick={addContribution}
            disabled={!participantText.trim() || !selectedCategory}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Ajouter ma contribution
          </button>

          <div className="mt-4 text-center text-sm text-gray-500">
            {contributions.length} contribution{contributions.length > 1 ? 's' : ''} au total
          </div>
        </div>
      </div>
    );
  }

  // Vue Tableau (Admin)
  const filteredContributions = filterCategory === 'all' 
    ? contributions 
    : contributions.filter(c => c.category === filterCategory);

  const getCategoryCount = (categoryName) => {
    return contributions.filter(c => c.category === categoryName).length;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{question}</h1>
              <p className="text-sm text-gray-600">
                {filterCategory === 'all' 
                  ? `${contributions.length} contribution${contributions.length > 1 ? 's' : ''} au total`
                  : `${filteredContributions.length} contribution${filteredContributions.length > 1 ? 's' : ''} affichée${filteredContributions.length > 1 ? 's' : ''}`
                }
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPresentationMode(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Mode Présentation
              </button>
              <button
                onClick={async () => {
                  setIsAnalyzing(true);
                  try {
                    const result = await analyzeThemes(contributions);
                    console.log('Résultat analyse IA:', result);
                    if (result.error) {
                      alert(result.error);
                    } else {
                      setAiAnalysis(result.themes || []);
                      setView('ai-analysis');
                    }
                  } catch (error) {
                    console.error('Erreur analyse IA:', error);
                    alert('Erreur lors de l\'analyse IA. Vérifiez la console.');
                  } finally {
                    setIsAnalyzing(false);
                  }
                }}
                disabled={isAnalyzing || contributions.length === 0}
                className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                {isAnalyzing ? 'Analyse en cours...' : 'Analyser avec IA'}
              </button>
              <button
                onClick={() => setView('qrcode')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <QrCode className="w-5 h-5" />
                QR Code
              </button>
              <button
                onClick={refreshBoard}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Actualiser
              </button>
              <button
                onClick={clearBoard}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Effacer
              </button>
              <button
                onClick={resetSession}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Nouvelle session
              </button>
            </div>
          </div>

          {/* Filtres par catégorie */}
          <div className="flex gap-2 items-center">
            <span className="text-sm font-semibold text-gray-700">Filtrer :</span>
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterCategory === 'all'
                  ? 'bg-gray-800 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tout ({contributions.length})
            </button>
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setFilterCategory(category.name)}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  filterCategory === category.name
                    ? 'shadow-md text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                style={{
                  backgroundColor: filterCategory === category.name ? category.color : undefined,
                  borderWidth: filterCategory === category.name ? '2px' : '0',
                  borderColor: filterCategory === category.name ? 'rgba(0,0,0,0.2)' : undefined
                }}
              >
                <span>{category.emoji}</span>
                <span>{category.name}</span>
                <span className="font-bold">({getCategoryCount(category.name)})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === 'qrcode' ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setView('board')}>
          <div className="bg-white rounded-2xl p-8 max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-center mb-4">Scannez pour participer</h2>
            <img src={generateQRCodeUrl()} alt="QR Code" className="w-full" />
            <p className="text-center text-sm text-gray-600 mt-4">
              Les participants peuvent scanner ce code pour ajouter leurs contributions
            </p>
            <button
              onClick={() => setView('board')}
              className="w-full mt-4 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
            >
              Fermer
            </button>
          </div>
        </div>
      ) : view === 'ai-analysis' ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-auto" onClick={() => setView('board')}>
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-pink-600 to-purple-600 text-transparent bg-clip-text">
              Analyse Thématique par IA
            </h2>
            
            {aiAnalysis && aiAnalysis.length > 0 ? (
              <div className="space-y-4">
                <p className="text-center text-gray-600 mb-6">
                  L'IA a identifié {aiAnalysis.length} thèmes principaux dans les {contributions.length} contributions
                </p>
                
                <div className="grid gap-4">
                  {aiAnalysis.map((theme, index) => (
                    <div 
                      key={index} 
                      className="border-2 border-purple-200 rounded-xl p-6 hover:border-purple-400 transition-colors bg-gradient-to-r from-purple-50 to-pink-50"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-bold text-purple-900 capitalize">
                          {theme.name}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="bg-purple-600 text-white px-4 py-1 rounded-full font-bold">
                            {theme.count} contribution{theme.count > 1 ? 's' : ''}
                          </span>
                          <span className="text-sm text-gray-600">
                            {Math.round(theme.avgScore * 100)}% confiance
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {theme.contributions.map((contrib) => {
                          const category = categories.find(c => c.name === contrib.category);
                          return (
                            <div 
                              key={contrib.id}
                              className="bg-white rounded-lg p-3 shadow-sm border-l-4"
                              style={{ borderLeftColor: category?.color || '#gray' }}
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-xl">{category?.emoji || '📝'}</span>
                                <div>
                                  <p className="font-medium">{contrib.text}</p>
                                  <p className="text-sm text-gray-500">{category?.name}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Aucune analyse disponible</p>
              </div>
            )}
            
            <button
              onClick={() => setView('board')}
              className="w-full mt-6 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-colors font-bold"
            >
              Retour au tableau
            </button>
          </div>
        </div>
      ) : null}

      {/* Contrôles Zoom/Pan */}
      <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 flex gap-2 z-40">
        <button
          onClick={() => handleZoom(0.2)}
          className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 font-bold"
          title="Zoom avant"
        >
          +
        </button>
        <button
          onClick={() => handleZoom(-0.2)}
          className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 font-bold"
          title="Zoom arrière"
        >
          −
        </button>
        <button
          onClick={resetView}
          className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700"
          title="Réinitialiser la vue"
        >
          ⟲
        </button>
        <span className="text-sm text-gray-600 self-center px-2">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      <div 
        className="relative h-[calc(100vh-88px)] overflow-hidden contributions-container cursor-grab active:cursor-grabbing"
        onMouseMove={(e) => {
          handleMouseMove(e);
          handlePanMove(e);
        }}
        onMouseDown={handlePanStart}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={(e) => {
          e.preventDefault();
          handleZoom(e.deltaY > 0 ? -0.1 : 0.1);
        }}
      >
        <div
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
            transition: isPanning || draggingId ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          {filteredContributions.map((contrib) => (
            <div
              key={contrib.id}
              className="absolute p-4 shadow-lg rounded-lg cursor-move hover:shadow-xl transition-all duration-300 animate-fadeIn"
              style={{
                backgroundColor: contrib.color,
                left: `${contrib.x}%`,
                top: `${contrib.y}%`,
                transform: `rotate(${contrib.rotation}deg)`,
                minWidth: '150px',
                maxWidth: '250px',
                userSelect: 'none',
                animation: 'fadeIn 0.5s ease-out'
              }}
              onMouseDown={(e) => {
                if (!e.ctrlKey && e.button === 0) {
                  handleMouseDown(e, contrib);
                }
              }}
            >
              <p className="text-gray-800 font-medium break-words pointer-events-none">{contrib.text}</p>
              {contrib.category && (
                <p className="text-xs text-gray-600 mt-2 italic pointer-events-none">{contrib.category}</p>
              )}
            </div>
          ))}
          
          {filteredContributions.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-400 text-xl">
                {filterCategory === 'all' 
                  ? 'En attente de contributions...' 
                  : `Aucune contribution dans la catégorie "${filterCategory}"`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mode Présentation */}
      {presentationMode && (
        <div className="fixed inset-0 bg-gray-900 z-50">
          <div className="h-full w-full relative">
            {/* Barre supérieure minimaliste */}
            <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 flex justify-between items-center z-10">
              <h1 className="text-2xl font-bold">{question}</h1>
              <button
                onClick={() => setPresentationMode(false)}
                className="bg-white text-black px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                ✕ Quitter
              </button>
            </div>

            {/* Tableau plein écran avec zoom/pan */}
            <div 
              className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
              onMouseMove={(e) => {
                handleMouseMove(e);
                handlePanMove(e);
              }}
              onMouseDown={handlePanStart}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={(e) => {
                e.preventDefault();
                handleZoom(e.deltaY > 0 ? -0.1 : 0.1);
              }}
            >
              <div
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  transformOrigin: '0 0',
                  width: '100%',
                  height: '100%',
                  transition: isPanning || draggingId ? 'none' : 'transform 0.2s ease-out'
                }}
              >
                {filteredContributions.map((contrib) => (
                  <div
                    key={contrib.id}
                    className="absolute p-4 shadow-2xl rounded-lg animate-fadeIn"
                    style={{
                      backgroundColor: contrib.color,
                      left: `${contrib.x}%`,
                      top: `${contrib.y}%`,
                      transform: `rotate(${contrib.rotation}deg)`,
                      minWidth: '150px',
                      maxWidth: '250px',
                      animation: 'fadeIn 0.5s ease-out'
                    }}
                  >
                    <p className="text-gray-800 font-medium break-words">{contrib.text}</p>
                    {contrib.category && (
                      <p className="text-xs text-gray-600 mt-2 italic">{contrib.category}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contrôles zoom minimalistes */}
            <div className="fixed bottom-6 right-6 bg-black bg-opacity-70 text-white rounded-lg p-3 flex gap-2">
              <button
                onClick={() => handleZoom(0.2)}
                className="px-4 py-2 hover:bg-white hover:text-black rounded transition-colors font-bold"
              >
                +
              </button>
              <button
                onClick={() => handleZoom(-0.2)}
                className="px-4 py-2 hover:bg-white hover:text-black rounded transition-colors font-bold"
              >
                −
              </button>
              <button
                onClick={resetView}
                className="px-4 py-2 hover:bg-white hover:text-black rounded transition-colors"
              >
                ⟲
              </button>
              <span className="self-center px-2">
                {Math.round(zoom * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
