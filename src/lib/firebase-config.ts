
// NOTE: This file contains placeholder configurations.
// You MUST replace them with your actual Firebase project configurations
// for pre-production and production environments.

export const firebaseConfigs = {
  development: {
    apiKey: "AIzaSyC2uRlKpLaJtOweEgAKq-h2iuXf-WKPHeY",
    authDomain: "studentverse-hgt33.firebaseapp.com",
    projectId: "studentverse-hgt33",
    storageBucket: "studentverse-hgt33.firebasestorage.app",
    messagingSenderId: "251333761093",
    appId: "1:251333761093:web:03ffbabfd62e9c55d32b2c"
  },
  'pre-prod': {
    // TODO: Replace with your PRE-PRODUCTION Firebase project config
    apiKey: "AIzaSyC2uRlKpLaJtOweEgAKq-h2iuXf-WKPHeY",
    authDomain: "studentverse-hgt33.firebaseapp.com",
    projectId: "studentverse-hgt33",
    storageBucket: "studentverse-hgt33.firebasestorage.app",
    messagingSenderId: "251333761093",
    appId: "1:251333761093:web:03ffbabfd62e9c55d32b2c"
  },
  production: {
    // TODO: Replace with your PRODUCTION Firebase project config
    apiKey: "AIzaSyC2uRlKpLaJtOweEgAKq-h2iuXf-WKPHeY",
    authDomain: "studentverse-hgt33.firebaseapp.com",
    projectId: "studentverse-hgt33",
    storageBucket: "studentverse-hgt33.firebasestorage.app",
    messagingSenderId: "251333761093",
    appId: "1:251333761093:web:03ffbabfd62e9c55d32b2c"
  },
};

export type Environment = keyof typeof firebaseConfigs;
