# Simple Multiplayer Chess

This is a simplified no-login multiplayer chess game for GitHub Pages.

## What changed

- No timer at all. The game is unlimited.
- No create-link button.
- No flip-board button.
- No local-board button.
- No extra help panel inside the game.
- Left column: moves.
- Middle: chess board.
- Right column: username + room code multiplayer options.
- Room code must be exactly 3 capital letters + 3 numbers, for example `ABC123`.
- First user to enter a new room code becomes White.
- Second user who enters the same room code becomes Black.
- Both users must enter a username.

## PNG piece folder structure

Put your PNG files here:

```text
assets/pieces/wk.png
assets/pieces/wq.png
assets/pieces/wr.png
assets/pieces/wb.png
assets/pieces/wn.png
assets/pieces/wp.png

assets/pieces/bk.png
assets/pieces/bq.png
assets/pieces/br.png
assets/pieces/bb.png
assets/pieces/bn.png
assets/pieces/bp.png
```

Full structure:

```text
woodboard-simple-multiplayer-chess/
├── index.html
├── style.css
├── app.js
├── firebase-config.js
├── firebase-rules.json
└── assets/
    └── pieces/
        ├── wk.png
        ├── wq.png
        ├── wr.png
        ├── wb.png
        ├── wn.png
        ├── wp.png
        ├── bk.png
        ├── bq.png
        ├── br.png
        ├── bb.png
        ├── bn.png
        └── bp.png
```

Recommended PNG format:

```text
transparent background
same canvas size for every piece
512x512 px or 256x256 px
piece centered
similar padding for all pieces
```

## Firebase setup

GitHub Pages is static hosting. It cannot store live chess moves by itself, so this uses Firebase Realtime Database.

This version does not use Firebase Authentication.

Open `firebase-config.js` and change:

```js
export const ENABLE_MULTIPLAYER = false;
```

to:

```js
export const ENABLE_MULTIPLAYER = true;
```

Then paste your Firebase web app config.

In Firebase Realtime Database rules, use the included `firebase-rules.json`:

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

These rules are open because you asked for no authentication. This is fine for a private casual game with friends, but not secure for a public serious chess website.

## How to play with a friend

1. Player 1 opens the site.
2. Player 1 enters username and room code, for example `ABC123`.
3. Player 1 clicks **Create / Join Room**.
4. Player 1 sends only the room code `ABC123` to Player 2.
5. Player 2 opens the same site.
6. Player 2 enters their username and the same room code `ABC123`.
7. Player 2 clicks **Create / Join Room**.
8. White and Black can now play.

For testing on the same computer, use two different browsers or one normal window and one incognito window. The same browser keeps the same player ID.
