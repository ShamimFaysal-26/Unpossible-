import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export interface AuthUserInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

export function formatAuthUser(user: FirebaseUser | null): AuthUserInfo | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous
  };
}

export async function signInWithGoogle(): Promise<AuthUserInfo> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const formatted = formatAuthUser(result.user);
  if (!formatted) throw new Error('Authentication succeeded but user profile was null');
  return formatted;
}

export async function signInWithEmail(email: string, password: string): Promise<AuthUserInfo> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const formatted = formatAuthUser(result.user);
  if (!formatted) throw new Error('Sign in succeeded but user profile was null');
  return formatted;
}

export async function signUpWithEmail(email: string, password: string, displayName?: string): Promise<AuthUserInfo> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && result.user) {
    try {
      await updateProfile(result.user, { displayName });
    } catch (e) {
      console.warn('Failed to set display name on new user profile', e);
    }
  }
  const formatted = formatAuthUser(result.user);
  if (!formatted) throw new Error('Account created but user profile was null');
  return formatted;
}

export async function sendResetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}
