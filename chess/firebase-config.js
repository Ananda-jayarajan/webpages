// No Authentication version.
//
// GitHub Pages cannot store live multiplayer state by itself.
// This version uses Firebase Realtime Database only.
// No Firebase Authentication is needed.
// Anyone with the room link can open the game and play as White/Black if a seat is open.
//
// Setup:
// 1. Create a Firebase project.
// 2. Create a Realtime Database.
// 3. Do NOT enable Authentication.
// 4. Paste your Firebase web app config below.
// 5. Change ENABLE_MULTIPLAYER to true.
// 6. Use firebase-rules.json as simple public demo rules.

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
