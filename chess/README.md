# WoodBoard Link Chess — No Authentication Version

This is a GitHub Pages friendly online chess game.

The important change in this version:

**No Firebase Authentication. No login. No anonymous sign-in.**

Anyone who opens the room link can join:
- First visitor becomes White.
- Second visitor becomes Black.
- Extra visitors become spectators.
- Refreshing the same browser keeps the same seat because the browser stores a local guest ID.

## Files

- `index.html`
- `style.css`
- `app.js`
- `firebase-config.js`
- `firebase-rules.json`

## How multiplayer works

GitHub Pages only hosts static files. It cannot store live game moves by itself.

So this project uses **Firebase Realtime Database only** as the shared room/move storage.

There is no account system. The browser creates a local random guest ID using `localStorage`.

## Setup

### 1. Create Firebase project

Create a Firebase project.

### 2. Create Realtime Database

Create a Realtime Database.

### 3. Do not enable Authentication

You do not need:
- Email login
- Google login
- Anonymous login

### 4. Add your Firebase config

Open:

```js
firebase-config.js
```

Change:

```js
export const ENABLE_MULTIPLAYER = false;
```

to:

```js
export const ENABLE_MULTIPLAYER = true;
```

Then paste your Firebase web app config:

```js
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

### 5. Use public database rules

Use the provided `firebase-rules.json` rules:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

This is intentionally open because you asked for link-only play with no Authentication.

Important: these public rules are okay for a casual demo, but not secure for a serious public website. Anyone who finds your database URL could write to it.

### 6. Upload to GitHub Pages

Upload all files to your GitHub repo.

Go to:

```text
Settings → Pages
```

Enable GitHub Pages.

## How to play

1. Open the GitHub Pages link.
2. Click **Create invite link**.
3. Send that link to your friend.
4. Your friend opens the link.
5. They join automatically and can start playing.

## Local testing

Open `index.html`.

If your browser blocks modules from local files, run:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```
