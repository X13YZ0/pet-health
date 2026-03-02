// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_jR7Fbb7gHRKL2RAQyfPooi8U5BgNcqU",
  authDomain: "pet-health-cebd2.firebaseapp.com",
  projectId: "pet-health-cebd2",
  storageBucket: "pet-health-cebd2.firebasestorage.app",
  messagingSenderId: "671203851163",
  appId: "1:671203851163:web:7ec84649b1614b1962ff3e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);