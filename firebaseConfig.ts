import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const STORAGE_KEY = 'pps_firebase_config';

const getStoredConfig = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.warn("Invalid stored firebase config");
    }
    return null;
};

// Check for environment variables (Standard React/Vite naming patterns)
const envConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
};

// Determine valid config: Env vars take precedence, then Local Storage
const hasEnvConfig = !!envConfig.apiKey;
const effectiveConfig = hasEnvConfig ? envConfig : getStoredConfig();

export const isFirebaseConfigured = !!effectiveConfig;

// Use a dummy config if nothing is available to prevent crash on initializeApp.
// This allows the app to load in "Offline Mode" (Local Storage only).
const finalConfig = effectiveConfig || {
    apiKey: "AIzaSy_PLACEHOLDER",
    authDomain: "placeholder.firebaseapp.com",
    projectId: "placeholder",
    storageBucket: "placeholder.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:0000000000000000000000"
};

// Initialize Firebase using compat mode to avoid potential export issues in certain environments
const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(finalConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();

// Utilities for the UI to set/clear config
export const saveFirebaseConfig = (configStr: string) => {
    try {
        const parsed = JSON.parse(configStr);
        // Basic validation
        if(!parsed.apiKey || !parsed.authDomain) throw new Error("Invalid Config JSON");
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        window.location.reload(); // Reload to apply
    } catch(e) {
        throw e;
    }
};

export const clearFirebaseConfig = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
};
