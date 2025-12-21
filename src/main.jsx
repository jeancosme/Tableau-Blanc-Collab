import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Configuration du système de stockage
const STORAGE_API = import.meta.env.VITE_STORAGE_API || 'http://localhost:3001/storage';
const USE_CLOUD_STORAGE = false; // true = API serveur, false = localStorage

// Système de stockage (cloud ou local)
if (!window.storage) {
  if (USE_CLOUD_STORAGE) {
    // Stockage dans le cloud via serveur Node.js
    window.storage = {
      get: async (key, shared = false) => {
        try {
          const response = await fetch(`${STORAGE_API}/${key}`);
          if (!response.ok) return null;
          return await response.json();
        } catch (error) {
          console.error('Erreur de lecture:', error);
          return null;
        }
      },
      set: async (key, value, shared = false) => {
        try {
          await fetch(`${STORAGE_API}/${key}`, {
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
          await fetch(`${STORAGE_API}/${key}`, { method: 'DELETE' });
        } catch (error) {
          console.error('Erreur de suppression:', error);
        }
      }
    };
  } else {
    // Stockage local (localStorage)
    window.storage = {
      get: async (key, shared = false) => {
        const data = localStorage.getItem(key);
        return data ? { value: data } : null;
      },
      set: async (key, value, shared = false) => {
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
