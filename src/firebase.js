// Firebase initialization using Vite environment variables
// Define the following in a .env.local file (never commit secrets):
// VITE_FIREBASE_API_KEY=
// VITE_FIREBASE_AUTH_DOMAIN=
// VITE_FIREBASE_PROJECT_ID=
// VITE_FIREBASE_STORAGE_BUCKET=
// VITE_FIREBASE_MESSAGING_SENDER_ID=
// VITE_FIREBASE_APP_ID=
// VITE_FIREBASE_DATABASE_URL=

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
}

// Initialize Firebase only once
const app = initializeApp(firebaseConfig)

// Export Auth and Realtime Database instances
export const auth = getAuth(app)
export const db = getDatabase(app)

export default app
