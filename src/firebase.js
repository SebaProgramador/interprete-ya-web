// src/firebase.js  (versión lista para CRA)
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,               // usar .env
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,       // interprete-ya.firebaseapp.com
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,         // interprete-ya
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET, // interprete-ya.appspot.com ✅
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Google (por si usas login con Google)
export const googleProvider = new GoogleAuthProvider();
export default app;
