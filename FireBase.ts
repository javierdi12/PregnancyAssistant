// Import the functions you need from the SDKs you need

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6GNqi3h43U0bn31ijFz_0XYQ0H9EF-rw",
  authDomain: "pregnancyassistant-1579f.firebaseapp.com",
  projectId: "pregnancyassistant-1579f",
  storageBucket: "pregnancyassistant-1579f.firebasestorage.app",
  messagingSenderId: "265408256669",
  appId: "1:265408256669:web:48eddf9464c881d7ac1274"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {persistence: getReactNativePersistence(ReactNativeAsyncStorage)});