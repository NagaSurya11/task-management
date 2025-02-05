// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAmRiYpAfqB-y9LaVEcCG1m1qlEF5_-ag8",
  authDomain: "task-buddy-fed16.firebaseapp.com",
  projectId: "task-buddy-fed16",
  storageBucket: "task-buddy-fed16.firebasestorage.app",
  messagingSenderId: "1072271007743",
  appId: "1:1072271007743:web:bdbff34f5f87b3892111ca"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);