import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBat8XU3tgDaj4NAPTCrNKySqiIVtw0E-4",
  authDomain: "deliricamente-154b8.firebaseapp.com",
  projectId: "deliricamente-154b8",
  storageBucket: "deliricamente-154b8.firebasestorage.app",
  messagingSenderId: "632460960027",
  appId: "1:632460960027:web:a449a28bcaa2f1d5ae33be"
};
const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);
export default app;
