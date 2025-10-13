// Firebase configuration and initialization
// @ts-ignore - Firebase SDK from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
// @ts-ignore - Firebase SDK from CDN
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, setDoc } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
import { config } from './config.js';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: config.FIREBASE_API_KEY,
    authDomain: config.FIREBASE_AUTH_DOMAIN,
    projectId: config.FIREBASE_PROJECT_ID,
    storageBucket: config.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
    appId: config.FIREBASE_APP_ID,
    measurementId: config.FIREBASE_MEASUREMENT_ID,
    databaseURL: `https://${config.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`
};

// Initialize Firebase
console.log('🔍 Initializing Firebase...');
let app, db;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
  
  db = getFirestore(app);
  console.log('✅ Firestore database initialized successfully');
  
  // Test Firestore connection
  console.log('🔍 Testing Firestore connection...');
  try {
    const testCollection = collection(db, 'test');
    const testDoc = doc(testCollection, 'connection-test');
    setDoc(testDoc, { timestamp: new Date().toISOString() })
      .then(() => console.log('✅ Firestore write test successful'))
      .catch((error) => console.error('❌ Firestore write test failed:', error));
  } catch (error) {
    console.error('❌ Firestore test setup failed:', error);
  }
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

