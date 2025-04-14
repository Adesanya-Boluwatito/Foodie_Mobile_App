// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore, 
  initializeFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection,
  query,
  where
} from "firebase/firestore"
import {initializeAuth, getReactNativePersistence} from "firebase/auth"
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_DATABASE_URL,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
  CLIENT_ID
} from '@env';

// Log the Firebase config for verification in production builds
console.log('Firebase Config (API_KEY):', FIREBASE_API_KEY ? FIREBASE_API_KEY.substring(0, 5) + '...' : 'missing');
console.log('Web Client ID:', CLIENT_ID ? CLIENT_ID.substring(0, 15) + '...' : 'missing');

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  databaseURL: FIREBASE_DATABASE_URL,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId:FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Authentication
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);
AsyncStorage.setItem('firebasePersistence', 'getReactNativePersistence');

// Export the objects
export { app, auth, db, doc, getDoc, setDoc, collection, query, where };



//Android: 1067454371034-p4uq4g9c1gosid81kiigjaee555iphlt.apps.googleusercontent.com