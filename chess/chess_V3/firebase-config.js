// No-authentication multiplayer. Anyone with a room link can open the game.
// First browser gets White, second browser gets Black.
// GitHub Pages cannot store live chess moves by itself, so Firebase Realtime Database is used as shared room storage.
// This version does NOT use Firebase Authentication.

export const ENABLE_MULTIPLAYER = true;

export const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://PASTE_YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "PASTE_YOUR_PROJECT",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};
