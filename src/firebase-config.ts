// Firebase configuration and initialization
// @ts-ignore - Firebase SDK from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
// @ts-ignore - Firebase SDK from CDN
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { config } from './config.js';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: config.FIREBASE_API_KEY,
    authDomain: config.FIREBASE_AUTH_DOMAIN,
    projectId: config.FIREBASE_PROJECT_ID,
    storageBucket: config.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
    appId: config.FIREBASE_APP_ID,
    measurementId: config.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
console.log('🔍 Initializing Firebase...');
let app, db;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
  
  db = getFirestore(app);
  console.log('✅ Firestore database initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Export Firebase utilities
export const firebaseUtils = {
    db,
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    getDocs,
    setDoc
};

// Make Firebase available globally for compatibility
declare global {
    interface Window {
        firebase: any;
        firebaseReady: boolean;
        SimpleFirestoreService: any;
        firestoreServiceReady: boolean;
    }
}

// Initialize global Firebase reference
(window as any).firebase = firebaseUtils;
(window as any).firebaseReady = true;

