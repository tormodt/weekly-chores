// Firebase configuration and initialization
// @ts-ignore - Firebase SDK from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
// @ts-ignore - Firebase SDK from CDN
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDDBrcI5dZWgZD2J1ahtY8unYOJOTtcTCE",
    authDomain: "chores-3cde1.firebaseapp.com",
    projectId: "chores-3cde1",
    storageBucket: "chores-3cde1.firebasestorage.app",
    messagingSenderId: "985200279642",
    appId: "1:985200279642:web:c02591d9ab43eb414dd863",
    measurementId: "G-L3C6S2RP58"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

console.log('Firebase SDK loaded and ready');
