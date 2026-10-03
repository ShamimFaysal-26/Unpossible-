import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, getDocFromServer, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if configured
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Test connection validator as mandated by Firebase skill
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    const testDocRef = doc(db, 'test', 'connection');
    await setDoc(testDocRef, {
      status: 'connected',
      timestamp: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore connection check warning:', error);
    return false;
  }
}

export default app;
