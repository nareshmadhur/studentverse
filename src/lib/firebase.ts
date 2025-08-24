
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

const getEnvironment = (): Environment => {
    if (typeof window !== 'undefined') {
        const storedEnv = localStorage.getItem('tutoraid-env');
        if (storedEnv && ['development', 'pre-prod', 'production'].includes(storedEnv)) {
            return storedEnv as Environment;
        }
    }
    return 'development';
}

const getCollectionName = (baseName: string): string => {
    const env = getEnvironment();
    if (env === 'development') {
        return baseName;
    }
    return `${env}_${baseName}`;
}

export { db, auth, getEnvironment, getCollectionName };
