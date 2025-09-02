// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDm45MKYqGF54_dRg0GGkv1RlXbknHgTYg",
  authDomain: "interprete-ya.firebaseapp.com",
  projectId: "interprete-ya",
  storageBucket: "interprete-ya.appspot.com", // ✅ importante
  messagingSenderId: "794221438438",
  appId: "1:794221438438:web:5a0916d17539da00822227",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
