# WoodBoard Chess — Aesthetic Pieces Edition

This is the no-authentication multiplayer chess version, but with updated custom SVG chess pieces.

## What's changed

- Replaced plain Unicode text pieces with custom **vector chess pieces**
- Style is closer to the aesthetic look in your reference:
  - soft sculpted shapes
  - dark gray black pieces
  - off-white white pieces
  - thicker outlines
  - cleaner chess-board presentation
- Captured pieces and promotion choices now use the same visual style

## Multiplayer

Still works as:
- no login
- no authentication
- room link sharing
- GitHub Pages friendly
- Firebase Realtime Database for live move syncing

## Setup

Open `firebase-config.js` and set:

```js
export const ENABLE_MULTIPLAYER = true;
```

Then paste your Firebase config.

Use the public rules from `firebase-rules.json`.

## Files

- `index.html`
- `style.css`
- `app.js`
- `firebase-config.js`
- `firebase-rules.json`
