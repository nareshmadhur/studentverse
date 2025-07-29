// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2uRlKpLaJtOweEgAKq-h2iuXf-WKPHeY",
  authDomain: "studentverse-hgt33.firebaseapp.com",
  projectId: "studentverse-hgt33",
  storageBucket: "studentverse-hgt33.firebasestorage.app",
  messagingSenderId: "251333761093",
  appId: "1:251333761093:web:fd22f08136b239fed32b2c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
