import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { firebaseStorage } from './firebase.js'

// Configuration du système de stockage
// En production (Vercel), USE_FIREBASE sera automatiquement true
const USE_FIREBASE = import.meta.env.PROD || false; // true en production, false en dev
const USE_SERVER = !USE_FIREBASE && true; // true = Serveur API (stockage cloud), false = localStorage

// Système de stockage (Firebase, Serveur ou local)
if (!window.storage) {
  if (USE_FIREBASE) {
    // Stockage Firebase avec synchronisation en temps réel
    window.storage = firebaseStorage;
  } else if (USE_SERVER) {
    // Stockage via serveur API (NextCloud, OneDrive, etc.)
    window.storage = {
      get: async (key) => {
        try {
          const response = await fetch(`/storage/${key}`);
          if (!response.ok) return null;
          return await response.json();
        } catch (error) {
          console.error('Erreur de lecture:', error);
          return null;
        }
      },
      set: async (key, value) => {
        try {
          await fetch(`/storage/${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value })
          });
        } catch (error) {
          console.error('Erreur d\'écriture:', error);
        }
      },
      delete: async (key) => {
        try {
          await fetch(`/storage/${key}`, { method: 'DELETE' });
        } catch (error) {
          console.error('Erreur de suppression:', error);
        }
      }
    };
  } else {
    // Stockage local (localStorage)
    window.storage = {
      get: async (key) => {
        const data = localStorage.getItem(key);
        return data ? { value: data } : null;
      },
      set: async (key, value) => {
        localStorage.setItem(key, value);
      },
      delete: async (key) => {
        localStorage.removeItem(key);
      }
    };
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
