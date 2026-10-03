# ShareMind - Password Social & Shared Vault

A modern, responsive, ultra-premium password management web application built with **Vanilla HTML5, Vanilla CSS3, and Vanilla JavaScript (ES Modules)**, fully integrated with **Firebase Authentication**.

## 🚀 Features

- **Firebase Authentication**:
  - Sign in with pre-configured Firebase users (`signInWithEmailAndPassword`).
  - Auth persistence configuration (Keep me signed in vs. session only).
  - Password Reset via Firebase email (`sendPasswordResetEmail`).
  - Automatic Auth state monitoring (`onAuthStateChanged`).
  - User profile session metadata viewer (UID, Verification Status, Creation Date, Last Sign-In).

- **Password Vault & Social Share**:
  - Store, search, and filter passwords by category (Social, Work, Personal).
  - Show / Mask password toggles.
  - 1-Click copy to clipboard for credentials and Firebase UID.
  - Add new credentials with category tagging and magic fill from generator.

- **Interactive Password Generator**:
  - Customizable password length (8 to 40 characters).
  - Checkboxes for Uppercase, Lowercase, Numbers, and Symbols.
  - Entropy-based Password Strength Meter (Weak, Fair, Good, Strong).
  - Regenerate & Copy buttons.

- **Design & UX**:
  - Ultra-sleek dark mode glassmorphism UI with ambient background glows.
  - Animated toast notifications for success, warning, and detailed error messages.
  - Completely responsive for desktop, tablet, and mobile displays.

## 📁 File Structure

```
password-social/
├── index.html           # Main semantic HTML5 structure & layout
├── styles.css           # Vanilla CSS design system (glassmorphism & tokens)
├── firebase-config.js   # Firebase App & Auth initialization (using official CDN ESM)
├── auth.js             # Encapsulated Firebase Auth functions & error translation
└── app.js              # Vanilla JS app controller, state, & DOM event listeners
```

## 🛠️ Firebase Credentials Configured

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBD6SozT0NRUAzyZKG0BeuTCXAqWWc_Bac",
  authDomain: "social-junk.firebaseapp.com",
  databaseURL: "https://social-junk-default-rtdb.firebaseio.com",
  projectId: "social-junk",
  storageBucket: "social-junk.firebasestorage.app",
  messagingSenderId: "685663028559",
  appId: "1:685663028559:web:05f8d54a9f27f24d6cf13a"
};
```

## 💻 How to Run Locally

Because the app uses standard native ES Modules (`import`/`export`), web browsers require the files to be served via any HTTP local server (rather than `file://` protocol):

1. **Option 1: VS Code Live Server**: Right-click `index.html` in VS Code and click **Open with Live Server**.
2. **Option 2: Python**: Run `python3 -m http.server 8000` in the directory, then navigate to `http://localhost:8000`.
3. **Option 3: Node / npx**: Run `npx serve` or `npx http-server` in the directory.
