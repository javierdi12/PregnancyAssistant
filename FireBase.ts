import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// WARNING: Replace the placeholders below with your actual Firebase config
const firebaseConfig = {
 apiKey: "AIzaSyC6GNqi3h43U0bn31ijFz_0XYQ0H9EF-rw",
  authDomain: "pregnancyassistant-1579f.firebaseapp.com",
  projectId: "pregnancyassistant-1579f",
  storageBucket: "pregnancyassistant-1579f.firebasestorage.app",
  messagingSenderId: "265408256669",
  appId: "1:265408256669:web:48eddf9464c881d7ac1274"

};

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
export const auth = initializeAuth(app);

export const storage = getStorage(app);

// Initialize Firestore
export const db = getFirestore(app);