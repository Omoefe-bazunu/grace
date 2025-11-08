// services/firebaseConfig.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDR92dQGWJLn9R2QcpQApsVP1ly5zMncqM',
  authDomain: 'grace-cc555.firebaseapp.com',
  projectId: 'grace-cc555',
  storageBucket: 'grace-cc555.firebasestorage.app',
  messagingSenderId: '934171863903',
  appId: '1:934171863903:web:c64f369ceb7d1f68d6a4ea',
  measurementId: 'G-5ZFQ4W4L1D',
};

// Initialize Firebase app
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
