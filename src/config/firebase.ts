// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDbPHEvXs2IRJz3wz64Sz1ugZWD0Dyt7yc",
  authDomain: "hackatonamob4.firebaseapp.com",
  projectId: "hackatonamob4",
  storageBucket: "hackatonamob4.firebasestorage.app",
  messagingSenderId: "507969476135",
  appId: "1:507969476135:web:1a25499c72d8708e4a2002",
  measurementId: "G-X485Y54BL9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth: Auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
