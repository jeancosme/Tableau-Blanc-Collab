import React, { useState, useEffect } from 'react';
import { Plus, Users, Trash2, QrCode, RefreshCw } from 'lucide-react';

const App = () => {
  const [view, setView] = useState('setup'); // 'setup', 'board', 'participant'
  const [question, setQuestion] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [contributions, setContributions] = useState([]);
  const [participantText, setParticipantText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{question}</h1>
            <p className="text-sm text-gray-600">{contributions.length} contribution{contributions.length > 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-2">
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
      ) : null}

      <div 
        className="relative h-[calc(100vh-88px)] overflow-hidden contributions-container"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {contributions.map((contrib) => (
          <div
            key={contrib.id}
            className="absolute p-4 shadow-lg rounded-lg cursor-move hover:shadow-xl transition-shadow"
            style={{
              backgroundColor: contrib.color,
              left: `${contrib.x}%`,
              top: `${contrib.y}%`,
              transform: `rotate(${contrib.rotation}deg)`,
              minWidth: '150px',
              maxWidth: '250px',
              userSelect: 'none'
            }}
            onMouseDown={(e) => handleMouseDown(e, contrib)}
          >
            <p className="text-gray-800 font-medium break-words pointer-events-none">{contrib.text}</p>
            {contrib.category && (
              <p className="text-xs text-gray-600 mt-2 italic pointer-events-none">{contrib.category}</p>
            )}
          </div>
        ))}
        
        {contributions.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-400 text-xl">En attente de contributions...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
