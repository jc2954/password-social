// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


export const firebaseConfig = {
  apiKey: "AIzaSyBD6SozT0NRUAzyZKG0BeuTCXAqWWc_Bac",
  authDomain: "social-junk.firebaseapp.com",
  databaseURL: "https://social-junk-default-rtdb.firebaseio.com",
  projectId: "social-junk",
  storageBucket: "social-junk.firebasestorage.app",
  messagingSenderId: "685663028559",
  appId: "1:685663028559:web:05f8d54a9f27f24d6cf13a"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth service
export const auth = getAuth(app);

// Initialize Firebase Realtime Database service
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

export const db = getDatabase(app);

// Export Auth & Database methods for clean architectural separation
export {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  getDatabase,
  ref,
  get,
  set,
  update,
  onValue
};

