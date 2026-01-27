// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4woEevaPGv7PUHOQrxehVYiEaIXcyq6s",
  authDomain: "dbangles-94906.firebaseapp.com",
  projectId: "dbangles-94906",
  storageBucket: "dbangles-94906.firebasestorage.app",
  messagingSenderId: "691280572993",
  appId: "1:691280572993:web:c96e17a2d935f55b6bccc0",
  measurementId: "G-93PJELLW5J"
};

// Initialize Firebase (prevent multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, storage, db, auth };
