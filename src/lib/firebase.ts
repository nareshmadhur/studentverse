
import { initializeApp, getApps, getApp, deleteApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseConfigs, type Environment } from './firebase-config';

let app;
let auth;
let db;

const getEnvironment = (): Environment => {
    if (typeof window !== 'undefined') {
        return (localStorage.getItem('tutoraid-env') as Environment) || 'development';
    }
    return 'development';
}

const initializeFirebase = (env: Environment) => {
    const config = firebaseConfigs[env];
    const appName = `tutoraid-${env}`;

    // Check if the app for the current environment is already initialized
    const existingApp = getApps().find(app => app.name === appName);

    if (existingApp) {
        app = existingApp;
    } else {
        // To avoid re-initializing on hot reloads, we check if an app with this name exists
        try {
            app = getApp(appName);
        } catch (e) {
            app = initializeApp(config, appName);
        }
    }
    
    auth = getAuth(app);
    db = getFirestore(app);
};

// Initialize with the default/stored environment
initializeFirebase(getEnvironment());

export { db, auth, getEnvironment, initializeFirebase, type Environment };
