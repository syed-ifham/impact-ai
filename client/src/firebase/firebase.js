// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6m5zTi82DQWnEpP_ng6Zb0eu51PmyvMc",
  authDomain: "impact-ai-83f38.firebaseapp.com",
  projectId: "impact-ai-83f38",
  storageBucket: "impact-ai-83f38.firebasestorage.app",
  messagingSenderId: "645161675306",
  appId: "1:645161675306:web:c4f9f165e5bea48b107153",
  measurementId: "G-WL28RLC2WD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);