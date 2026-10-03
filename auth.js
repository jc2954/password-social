// auth.js
import { 
  auth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "./firebase-config.js";

/**
 * Friendly error messages for common Firebase Auth errors
 */
export function getFriendlyErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email address or password. Please check your credentials and try again.';
    case 'auth/invalid-email':
      return 'The email address provided is formatted incorrectly.';
    case 'auth/user-disabled':
      return 'This user account has been disabled by an administrator.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed login attempts. Please reset your password or try again later.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please verify your internet connection and try again.';
    case 'auth/missing-password':
      return 'Please enter a password to sign in.';
    case 'auth/email-already-in-use':
      return 'This email address is already in use by another user account.';
    case 'auth/weak-password':
      return 'The password is too weak. Please use at least 6 characters with mixed letters and numbers.';
    default:
      return errorCode.replace('auth/', '').replace(/-/g, ' ');
  }
}

/**
 * Authenticate user with Email and Password
 * @param {string} email 
 * @param {string} password 
 * @param {boolean} rememberMe 
 */
export async function loginUser(email, password, rememberMe = true) {
  try {
    const persistenceMode = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    try {
      await setPersistence(auth, persistenceMode);
    } catch (persistErr) {
      console.warn("Auth persistence notice (cross-origin iframe bypassed):", persistErr.message);
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: getFriendlyErrorMessage(error.code), rawCode: error.code };
  }
}

/**
 * Send Password Reset Email
 * @param {string} email 
 */
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: getFriendlyErrorMessage(error.code) };
  }
}

/**
 * Sign out the active user
 */
export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: getFriendlyErrorMessage(error.code) };
  }
}

/**
 * Register auth state listener
 * @param {function} callback 
 */
export function initAuthStateListener(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}
