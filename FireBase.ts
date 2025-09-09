import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyC6GNqi3h43U0bn31ijFz_0XYQ0H9EF-rw",
  authDomain: "pregnancyassistant-1579f.firebaseapp.com",
  projectId: "pregnancyassistant-1579f",
  storageBucket: "pregnancyassistant-1579f.appspot.com",
  messagingSenderId: "265408256669",
  appId: "1:265408256669:web:48eddf9464c881d7ac1274"
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
