import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyB5t6Jh5pUhGMfKgj_wCl52NSkdLAHb4dM",
  authDomain: "college-feedback-analyzer.firebaseapp.com",
  projectId: "college-feedback-analyzer",
  storageBucket: "college-feedback-analyzer.firebasestorage.app",
  messagingSenderId: "520204283711",
  appId: "1:520204283711:web:fa8820b03e9d4d34522d8a",
  measurementId: "G-2X2GNN608N",
};

// Initialize Firebase safely
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Initialize analytics when supported
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((yes) => {
      if (yes) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      /* analytics fallback */
    });
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type FirebaseUser,
};
