// This file is no longer needed with the collection prefix strategy.
// It is kept to avoid breaking imports in the project structure but is not used.
export const firebaseConfigs = {
  development: {
    apiKey: "AIzaSyC2uRlKpLaJtOweEgAKq-h2iuXf-WKPHeY",
    authDomain: "studentverse-hgt33.firebaseapp.com",
    projectId: "studentverse-hgt33",
    storageBucket: "studentverse-hgt33.firebasestorage.app",
    messagingSenderId: "251333761093",
    appId: "1:251333761093:web:03ffbabfd62e9c55d32b2c"
  },
};

export type Environment = keyof typeof firebaseConfigs;
