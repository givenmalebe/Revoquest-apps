// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

/** Read Vite env vars (set in root `.env` — see `.env.example`). */
function requireViteEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];
  if (!value || typeof value !== "string") {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env and add your Firebase project settings.`
    );
  }
  return value;
}

const firebaseConfig = {
  apiKey: requireViteEnv("VITE_FIREBASE_API_KEY"),
  authDomain: requireViteEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: requireViteEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: requireViteEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: requireViteEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: requireViteEnv("VITE_FIREBASE_APP_ID"),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with connection settings
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const analytics =
  typeof window !== "undefined" && firebaseConfig.measurementId
    ? getAnalytics(app)
    : null;

// Configure Firestore settings for better connection stability
import { connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';

// Add connection retry logic
let connectionRetries = 0;
const maxRetries = 3;

const handleConnectionError = async () => {
  if (connectionRetries < maxRetries) {
    connectionRetries++;
    console.log(`🔄 Retrying Firebase connection (attempt ${connectionRetries}/${maxRetries})`);
    try {
      await disableNetwork(db);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await enableNetwork(db);
      console.log('✅ Firebase connection restored');
    } catch (error) {
      console.error('❌ Failed to restore Firebase connection:', error);
      setTimeout(handleConnectionError, 2000 * connectionRetries);
    }
  } else {
    console.error('❌ Max Firebase connection retries reached');
    connectionRetries = 0;
  }
};

// Monitor connection state
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🌐 Network connection restored');
    enableNetwork(db).catch(handleConnectionError);
  });

  window.addEventListener('offline', () => {
    console.log('📴 Network connection lost');
  });
}

export { handleConnectionError };
export default app;
