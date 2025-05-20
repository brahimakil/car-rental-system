// Import the Firebase SDK
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNvVn85kI_pkAL4FavZh1l3jwq1STz-k0",
  authDomain: "car-rental-system-9799d.firebaseapp.com",
  projectId: "car-rental-system-9799d",
  storageBucket: "car-rental-system-9799d.firebasestorage.app",
  messagingSenderId: "530543855571",
  appId: "1:530543855571:web:f351ea815f133228071126",
  measurementId: "G-DX9FRD75TR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;