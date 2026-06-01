// Simple no-auth multiplayer config.
//
// This game uses Firebase Realtime Database only.
// It does NOT use Firebase Authentication.
//
// To enable online multiplayer:
// 1. Create a Firebase project.
// 2. Create a Realtime Database.
// 3. Paste your Firebase web app config below.
// 4. Set ENABLE_MULTIPLAYER to true.
// 5. In Realtime Database rules, use the rules from firebase-rules.json.

export const ENABLE_MULTIPLAYER = true;

export const firebaseConfig = {
  apiKey: "YOUR_REAL_API_KEY",
  authDomain: "YOUR_REAL_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_REAL_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_REAL_PROJECT",
  storageBucket: "YOUR_REAL_PROJECT.appspot.com",
  messagingSenderId: "YOUR_REAL_SENDER_ID",
  appId: "YOUR_REAL_APP_ID"
};
