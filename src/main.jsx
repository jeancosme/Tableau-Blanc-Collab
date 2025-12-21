import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Polyfill pour window.storage (stockage local simplifié)
if (!window.storage) {
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
