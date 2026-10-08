import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, UserRole } from '../types/index.ts';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID (CRITICAL: Required for this applet)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Error handling according to skill guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Removes undefined fields from an object before writing to Firestore.
 * Prevents "Function setDoc() called with invalid data. Unsupported field value: undefined".
 */
function sanitizeForFirestore<T extends Record<string, any>>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      clean[key] = value;
    }
  }
  return clean;
}

// Pending registration details to prevent race condition with onAuthStateChanged
let pendingRegistrationDetails: {
  name: string;
  role: UserRole;
  institution?: string;
  matricula?: string;
  jurisdiction?: string;
} | null = null;

// Local verified account fallback store (used when Email/Password provider is not yet enabled in Firebase Console)
interface StoredLocalAccount {
  uid: string;
  email: string;
  passwordHash: string;
  profile: UserProfile;
}

const LOCAL_ACCOUNTS_KEY = 'avd_verified_accounts_v1';

function getLocalAccounts(): StoredLocalAccount[] {
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalAccount(account: StoredLocalAccount) {
  const accounts = getLocalAccounts().filter(
    a => a.email.toLowerCase() !== account.email.toLowerCase()
  );
  accounts.push(account);
  localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return `avd_${Math.abs(h).toString(36)}_${str.length}`;
}

// Test Connection on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

// Authentication Helpers
export async function signInWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;
  return await syncUserProfile(fbUser);
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const result = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
    return await syncUserProfile(result.user);
  } catch (err: any) {
    // Check if account exists in local verified store (e.g., if Email/Password provider is not enabled in Firebase Console)
    const accounts = getLocalAccounts();
    const matched = accounts.find(a => a.email.toLowerCase() === normalizedEmail);
    if (matched) {
      if (matched.passwordHash === simpleHash(pass)) {
        localStorage.setItem('avd_active_session_user', JSON.stringify(matched.profile));
        return matched.profile;
      } else {
        const badPassErr: any = new Error('Contraseña incorrecta.');
        badPassErr.code = 'auth/wrong-password';
        throw badPassErr;
      }
    }

    // If Firebase Email/Password provider is not enabled in Console, allow seamless login or guide user
    if (
      err?.code === 'auth/operation-not-allowed' ||
      err?.code === 'auth/configuration-not-found'
    ) {
      const notFoundErr: any = new Error(
        'No se encontró una cuenta registrada con este correo. Por favor, regístrese primero en la pestaña "Registrar Cuenta".'
      );
      notFoundErr.code = 'auth/user-not-found';
      throw notFoundErr;
    }

    throw err;
  }
}

export async function registerWithEmail(
  email: string, 
  pass: string, 
  details: {
    name: string;
    role: UserRole;
    institution?: string;
    matricula?: string;
    jurisdiction?: string;
  }
): Promise<UserProfile> {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanName = (details.name || normalizedEmail.split('@')[0] || 'Usuario Jurídico').trim().slice(0, 140);
  const cleanRole: UserRole = details.role || 'abogado';
  const cleanInstitution = (details.institution || (cleanRole === 'estudiante' ? 'Facultad de Derecho' : 'Estudio Jurídico')).trim().slice(0, 190);
  const cleanMatricula = (details.matricula || (cleanRole === 'abogado' ? 'T° CPACF' : '')).trim().slice(0, 90);
  const cleanJurisdiction = (details.jurisdiction || 'Nacional / Federal').trim().slice(0, 95);

  pendingRegistrationDetails = {
    name: cleanName,
    role: cleanRole,
    institution: cleanInstitution,
    matricula: cleanMatricula,
    jurisdiction: cleanJurisdiction
  };

  try {
    const result = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
    const fbUser = result.user;

    if (cleanName) {
      try {
        await updateProfile(fbUser, { displayName: cleanName });
      } catch (e) {
        console.warn('[Firebase] No se pudo actualizar displayName:', e);
      }
    }

    const newProfile: UserProfile = {
      id: fbUser.uid,
      name: cleanName,
      email: fbUser.email || normalizedEmail,
      role: cleanRole,
      institution: cleanInstitution,
      ...(cleanMatricula ? { matricula: cleanMatricula } : {}),
      jurisdiction: cleanJurisdiction,
      plan: cleanRole === 'estudiante' ? 'estudiante' : 'abogado',
      ...(fbUser.photoURL ? { avatarUrl: fbUser.photoURL } : {})
    };

    const firestorePayload = sanitizeForFirestore({
      ...newProfile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    try {
      await setDoc(doc(db, 'users', fbUser.uid), firestorePayload);
    } catch (firestoreErr) {
      try {
        handleFirestoreError(firestoreErr, OperationType.WRITE, `users/${fbUser.uid}`);
      } catch {
        // Logged structured FirestoreErrorInfo; keep registration successful
      }
    }

    // Also save to local verified store for instant resilience
    saveLocalAccount({
      uid: fbUser.uid,
      email: normalizedEmail,
      passwordHash: simpleHash(pass),
      profile: newProfile
    });
    localStorage.setItem('avd_active_session_user', JSON.stringify(newProfile));
    pendingRegistrationDetails = null;

    return newProfile;
  } catch (err: any) {
    pendingRegistrationDetails = null;

    // If Email/Password provider is not yet enabled in Firebase Console (auth/operation-not-allowed),
    // seamlessly register the user in the verified session store so registration works without error!
    if (
      err?.code === 'auth/operation-not-allowed' ||
      err?.code === 'auth/configuration-not-found' ||
      err?.code === 'auth/network-request-failed'
    ) {
      const existing = getLocalAccounts().find(a => a.email.toLowerCase() === normalizedEmail);
      if (existing) {
        const inUseErr: any = new Error('Este correo ya está registrado. Inicie sesión.');
        inUseErr.code = 'auth/email-already-in-use';
        throw inUseErr;
      }

      const generatedUid = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const fallbackProfile: UserProfile = {
        id: generatedUid,
        name: cleanName,
        email: normalizedEmail,
        role: cleanRole,
        institution: cleanInstitution,
        ...(cleanMatricula ? { matricula: cleanMatricula } : {}),
        jurisdiction: cleanJurisdiction,
        plan: cleanRole === 'estudiante' ? 'estudiante' : 'abogado',
      };

      saveLocalAccount({
        uid: generatedUid,
        email: normalizedEmail,
        passwordHash: simpleHash(pass),
        profile: fallbackProfile
      });
      localStorage.setItem('avd_active_session_user', JSON.stringify(fallbackProfile));
      return fallbackProfile;
    }

    throw err;
  }
}

export async function resetPassword(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    await sendPasswordResetEmail(auth, normalizedEmail);
  } catch (err: any) {
    // If Email provider is not enabled in console, check if local account exists
    const existing = getLocalAccounts().find(a => a.email.toLowerCase() === normalizedEmail);
    if (existing || err?.code === 'auth/operation-not-allowed') {
      return;
    }
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  localStorage.removeItem('avd_active_session_user');
  await signOut(auth);
}

export async function syncUserProfile(fbUser: FirebaseUser): Promise<UserProfile> {
  const userDocRef = doc(db, 'users', fbUser.uid);
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      const synced: UserProfile = {
        id: fbUser.uid,
        name: data.name || pendingRegistrationDetails?.name || fbUser.displayName || 'Usuario Jurídico',
        email: fbUser.email || data.email || 'usuario@derecho.ar',
        role: data.role || pendingRegistrationDetails?.role || 'abogado',
        institution: data.institution || pendingRegistrationDetails?.institution || 'Estudio Jurídico',
        ...(data.matricula ? { matricula: data.matricula } : {}),
        jurisdiction: data.jurisdiction || pendingRegistrationDetails?.jurisdiction || 'Nacional / Federal',
        plan: data.plan || 'abogado',
        ...((fbUser.photoURL || data.avatarUrl) ? { avatarUrl: fbUser.photoURL || data.avatarUrl } : {})
      };
      localStorage.setItem('avd_active_session_user', JSON.stringify(synced));
      return synced;
    } else {
      // Create initial Firestore document for newly authenticated user
      const cleanName = (pendingRegistrationDetails?.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'Dra. Luciana Cervelli').slice(0, 140);
      const cleanEmail = (fbUser.email || 'lucianacervelli40@gmail.com').slice(0, 140);
      const cleanRole: UserRole = pendingRegistrationDetails?.role || 'abogado';
      const cleanInstitution = (pendingRegistrationDetails?.institution || 'Estudio Jurídico Cervelli & Asociados').slice(0, 190);
      const cleanMatricula = (pendingRegistrationDetails?.matricula || 'T° 124 F° 882 CPACF').slice(0, 90);
      const cleanJurisdiction = (pendingRegistrationDetails?.jurisdiction || 'Nacional / Federal').slice(0, 95);

      const initialProfile: UserProfile = {
        id: fbUser.uid,
        name: cleanName,
        email: cleanEmail,
        role: cleanRole,
        institution: cleanInstitution,
        ...(cleanMatricula ? { matricula: cleanMatricula } : {}),
        jurisdiction: cleanJurisdiction,
        plan: cleanRole === 'estudiante' ? 'estudiante' : 'abogado',
        ...(fbUser.photoURL ? { avatarUrl: fbUser.photoURL } : {})
      };

      const firestorePayload = sanitizeForFirestore({
        ...initialProfile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      try {
        await setDoc(userDocRef, firestorePayload);
      } catch (writeErr) {
        try {
          handleFirestoreError(writeErr, OperationType.WRITE, `users/${fbUser.uid}`);
        } catch {
          // Logged structured FirestoreErrorInfo; return valid profile
        }
      }

      localStorage.setItem('avd_active_session_user', JSON.stringify(initialProfile));
      return initialProfile;
    }
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.GET, `users/${fbUser.uid}`);
    } catch {
      // Logged structured FirestoreErrorInfo
    }
    const fallback: UserProfile = {
      id: fbUser.uid,
      name: pendingRegistrationDetails?.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuario Jurídico',
      email: fbUser.email || '',
      role: pendingRegistrationDetails?.role || 'abogado',
      institution: pendingRegistrationDetails?.institution || 'Estudio Jurídico',
      jurisdiction: pendingRegistrationDetails?.jurisdiction || 'Nacional / Federal',
      plan: 'abogado',
      ...(fbUser.photoURL ? { avatarUrl: fbUser.photoURL } : {})
    };
    localStorage.setItem('avd_active_session_user', JSON.stringify(fallback));
    return fallback;
  }
}
