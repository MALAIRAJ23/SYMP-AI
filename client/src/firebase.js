// Firebase configuration and initialization for Google Auth
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCrnQ5Maz3OsUC9pSJTzdPG4OuLLetOdMg',
  authDomain: 'symptoms-checker-a9665.firebaseapp.com',
  projectId: 'symptoms-checker-a9665',
  storageBucket: 'symptoms-checker-a9665.appspot.com',
  messagingSenderId: '586367526008',
  appId: '1:586367526008:web:037b874ad2ffa46b76398d',
  measurementId: 'G-VV0F6PHJSN',
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, analytics, db }; 