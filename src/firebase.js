import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, remove, onValue } from 'firebase/database';

// Configuration Firebase - À remplacer avec vos propres clés
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Système de stockage Firebase
export const firebaseStorage = {
  get: async (key) => {
    try {
      const dbRef = ref(database, key);
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        return { value: snapshot.val() };
      }
      return null;
    } catch (error) {
      console.error('Erreur de lecture Firebase:', error);
      return null;
    }
  },

  set: async (key, value) => {
    try {
      const dbRef = ref(database, key);
      await set(dbRef, value);
    } catch (error) {
      console.error('Erreur d\'écriture Firebase:', error);
    }
  },

  delete: async (key) => {
    try {
      const dbRef = ref(database, key);
      await remove(dbRef);
    } catch (error) {
      console.error('Erreur de suppression Firebase:', error);
    }
  },

  // Écouter les changements en temps réel
  listen: (key, callback) => {
    const dbRef = ref(database, key);
    return onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ value: snapshot.val() });
      } else {
        callback(null);
      }
    });
  }
};
