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

export const ENABLE_MULTIPLAYER = false;

export const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://PASTE_YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "PASTE_YOUR_PROJECT",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};
