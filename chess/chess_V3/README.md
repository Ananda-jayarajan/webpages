# WoodBoard Chess - PNG Pieces + Clear No-Login Multiplayer

This version fixes the confusing multiplayer flow, improves the timer behavior, and uses your own PNG chess pieces.

## Folder structure

Put your piece PNG files here:

```text
woodboard-chess/
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

## PNG naming convention

Use exactly these names:

```text
wk.png = white king
wq.png = white queen
wr.png = white rook
wb.png = white bishop
wn.png = white knight
wp.png = white pawn

bk.png = black king
bq.png = black queen
br.png = black rook
bb.png = black bishop
bn.png = black knight
bp.png = black pawn
```

The code loads pieces from `assets/pieces/`.

## Recommended PNG specs

Use transparent-background PNGs, same canvas size for all pieces, 512x512 or 256x256, centered with similar padding.

## Multiplayer setup

GitHub Pages cannot store live moves by itself, so this uses Firebase Realtime Database. This version does not use Firebase Authentication.

1. Open `firebase-config.js`.
2. Change `export const ENABLE_MULTIPLAYER = false;` to `true`.
3. Paste your Firebase web app config.
4. Use the included `firebase-rules.json` rules.
5. Upload the folder to GitHub Pages.

## How to use multiplayer

1. Open your chess site.
2. Click **Create online room link**.
3. Send the copied link to your friend.
4. First browser becomes White.
5. Second browser becomes Black.
6. Timer starts only after both players are seated.

## Timer behavior fixed

- Timer does not run while waiting for the second player.
- Timer starts when Black joins.
- Only the current side's timer decreases.
- After a legal move, the clock switches sides.
- Timeouts are written to the room state.
