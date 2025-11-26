
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// REPLACE WITH YOUR FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyBZTljgAY1kZs0euTDET3yaBth3_fe0N24",
  authDomain: "habits-alchemist.firebaseapp.com",
  projectId: "habits-alchemist",
  storageBucket: "habits-alchemist.firebasestorage.app",
  messagingSenderId: "267034176834",
  appId: "1:267034176834:web:25fd4d6b419dbd95c42cdb",
  measurementId: "G-C5ERX7BQ5W"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
