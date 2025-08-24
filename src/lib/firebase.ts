
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export type Environment = 'development' | 'pre-prod' | 'production';

const firebaseConfig = {
    apiKey: "AIzaSyC2uRlKpLaJtOweEgAKq-h2iuXf-WKPHeY",
    authDomain: "studentverse-hgt33.firebaseapp.com",
    projectId: "studentverse-hgt33",
    storageBucket: "studentverse-hgt33.firebasestorage.app",
    messagingSenderId: "251333761093",
    appId: "1:251333761093:web:03ffbabfd62e9c55d32b2c"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export const getCollectionName = (baseName: string, env: Environment): string => {
    const prefix = env === 'development' ? 'dev' : env;
    return `${prefix}_${baseName}`;
}

export { db, auth };
