import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let config: any = {};
try {
  // @ts-ignore
  config = firebaseConfig;
} catch {
  config = {};
}

const getEnv = (key: string): string | undefined => {
  try {
    return typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env as any)[key] : undefined;
  } catch {
    return undefined;
  }
};

const activeFirebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY') || config.apiKey,
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN') || config.authDomain,
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID') || config.projectId,
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET') || config.storageBucket,
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || config.messagingSenderId,
  appId: getEnv('VITE_FIREBASE_APP_ID') || config.appId,
  measurementId: config.measurementId
};

// Initialize Firebase once
export const app = getApps().length === 0 ? initializeApp(activeFirebaseConfig) : getApp();
export const auth = getAuth(app);

// Initialize Firebase Analytics if supported
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported && activeFirebaseConfig.measurementId) {
      getAnalytics(app);
    }
  }).catch(() => {});
}

// Standard scopes for basic authentication (non-sensitive: profile and email)
// This avoids triggering Google's "Google no verificó esta app" warning and eliminates repeated consent prompts
export const getLoginGoogleProvider = () => {
  const loginProvider = new GoogleAuthProvider();
  // Standard profile and email scopes do not require Google app verification
  loginProvider.addScope('email');
  loginProvider.addScope('profile');
  // Do NOT use prompt: 'consent', which forces the scary screen every time
  return loginProvider;
};

// Dedicated provider ONLY for Google Sheets synchronization when requested by admin
export const getGoogleSheetsProvider = () => {
  const sheetsProvider = new GoogleAuthProvider();
  sheetsProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
  sheetsProvider.setCustomParameters({
    access_type: 'offline'
  });
  return sheetsProvider;
};

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup - clean, fast, and remembers user session without repeating consent
export const googleSignIn = async (): Promise<{ user: FirebaseUser; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const provider = getLoginGoogleProvider();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }
    return { user: result.user, accessToken: cachedAccessToken || '' };
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      // User closed the popup or dismissed the auth window - normal user action, avoid loud console.error
      console.info('[Firebase Auth] Ventana de autenticación con Google cerrada por el usuario.');
    } else if (error?.code === 'auth/popup-blocked') {
      console.warn('[Firebase Auth] Ventana emergente bloqueada por el navegador.');
    } else if (error?.code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
      console.warn('[Firebase Auth] Dominio pendiente de autorizar en Firebase Console:', typeof window !== 'undefined' ? window.location.hostname : '');
    } else {
      console.error('Error al iniciar sesión con Google:', error);
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Sign in specifically for Google Sheets integration
export const googleSignInForSheets = async (): Promise<string | null> => {
  try {
    const provider = getGoogleSheetsProvider();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
      return cachedAccessToken;
    }
    return null;
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      console.info('[Firebase Auth Sheets] Ventana de conexión cerrada por el usuario.');
      return null;
    } else if (error?.code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
      console.warn('[Firebase Auth] Dominio pendiente de autorizar en Firebase Console para Google Sheets');
    } else {
      console.error('Error al conectar Google Sheets:', error);
    }
    throw error;
  }
};

// Sign in with Email & Password (Firebase Auth)
export const firebaseSignInWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return userCredential.user;
  } catch (error: any) {
    console.warn('Aviso en signInWithEmailAndPassword:', error?.code || error?.message);
    throw error;
  }
};

// Create User with Email & Password (Firebase Auth)
export const firebaseSignUpWithEmail = async (email: string, password: string, displayName?: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    return userCredential.user;
  } catch (error: any) {
    console.warn('Aviso en createUserWithEmailAndPassword:', error?.code || error?.message);
    throw error;
  }
};

// Reset Password with Firebase Auth
export const firebaseSendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error: any) {
    console.warn('Aviso en sendPasswordResetEmail:', error?.code || error?.message);
    throw error;
  }
};

// Listen to Firebase User state changes
export const subscribeToFirebaseUser = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getCurrentFirebaseUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Ensure User exists in Firebase Authentication (Console -> Authentication -> Users)
export const ensureFirebaseAuthUser = async (
  emailOrDoc: string,
  password?: string,
  displayName?: string
): Promise<FirebaseUser | null> => {
  const clean = (emailOrDoc || '').toLowerCase().trim();
  if (!clean) return null;
  const targetEmail = clean.includes('@') ? clean : `${clean.replace(/\D/g, '') || clean}@superpuntos.online`;
  const targetPassword = password && password.length >= 6 ? password : 'Superpuntos2026*';

  try {
    const cred = await createUserWithEmailAndPassword(auth, targetEmail, targetPassword);
    if (displayName && cred.user) {
      await updateProfile(cred.user, { displayName });
    }
    console.log('[Firebase Auth] Usuario registrado exitosamente en Firebase Authentication:', targetEmail);
    return cred.user;
  } catch (err: any) {
    if (err?.code === 'auth/email-already-in-use') {
      try {
        const cred = await signInWithEmailAndPassword(auth, targetEmail, targetPassword);
        return cred.user;
      } catch {
        return auth.currentUser;
      }
    }
    console.warn('[Firebase Auth] Aviso en ensureFirebaseAuthUser:', err?.code || err?.message);
    return auth.currentUser;
  }
};


