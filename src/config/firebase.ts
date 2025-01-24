import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCcph54z3rJRrXqjZHWa0ststLlnWfQrF4",
  authDomain: "russian-roullete.firebaseapp.com",
  projectId: "russian-roullete",
  storageBucket: "russian-roullete.firebasestorage.app",
  messagingSenderId: "894304037125",
  appId: "1:894304037125:web:5acf0bbca7a6ee08676f6c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.log('The current browser does not support persistence.');
    }
  });