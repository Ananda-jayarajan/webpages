# WoodBoard Simple Room-Code Chess v2

This version is intentionally simple:

- No timer
- No room-link button
- No flip-board button
- No local-board button
- No extra instruction section inside the game UI
- Left column: moves
- Middle: chess board
- Right column: username + room code multiplayer controls

## How players use it

Player 1:

1. Opens the site.
2. Enters username.
3. Enters a room code like `ABC123`.
4. Clicks **Create / Join Room**.
5. Sends the room code to friend.

Player 2:

1. Opens the same site.
2. Enters username.
3. Enters the same room code.
4. Clicks **Create / Join Room**.
5. The game starts.

The first browser becomes White. The second browser becomes Black.

## Room code rule

Room code must be:

```text
3 capital letters + 3 numbers
```

Examples:

```text
ABC123
CAT456
UOR789
```

## Important Firebase setup

GitHub Pages cannot create multiplayer rooms by itself. It only hosts HTML/CSS/JS.

You must enable Firebase Realtime Database.

Open:

```text
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

Then paste your Firebase web app config.

Use the rules in:

```text
firebase-rules.json
```

These rules are public because this is a no-authentication game:

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

## PNG piece folder

Put your piece images here:

```text
assets/pieces/
```

Required names:

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

The game has Unicode fallbacks, so if a PNG is missing, you will still see a chess piece.
