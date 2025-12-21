import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { firebaseStorage } from './firebase.js'

// Configuration du système de stockage
const USE_FIREBASE = true; // true = Firebase (sync temps réel), false = localStorage

// Système de stockage (Firebase ou local)
if (!window.storage) {
  if (USE_FIREBASE) {
    // Stockage Firebase avec synchronisation en temps réel
    window.storage = firebaseStorage;
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
