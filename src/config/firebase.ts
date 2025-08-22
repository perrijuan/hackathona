// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

export { app, analytics };
