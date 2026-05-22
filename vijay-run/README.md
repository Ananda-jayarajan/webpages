# The Villupuram Run Pro

A more sophisticated endless runner rebuilt from the original single-file prototype.

## How to run

Open `index.html` in your browser.

No server is required because this version uses plain HTML, CSS, and JavaScript.

## Project structure

```text
villupuram-run-pro/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── config.js
│   └── game.js
└── README.md
```

## Controls

- Jump: `Space`, `Arrow Up`, or swipe up
- Slide: `Arrow Down` or swipe down
- Pause: `P` or `Esc`

## What improved from the old version

- Separated HTML, CSS, config, and game engine logic
- Canvas-based rendering
- Parallax background
- Collectible vote coins
- Particle effects
- Floating score text
- High score using localStorage
- Pause/resume screen
- Difficulty scaling
- Better mobile controls
- Cleaner structure for adding images, sounds, and levels later

## Where to edit

Edit `js/config.js` to change:

- player physics
- speed and difficulty
- obstacle types
- scoring
- colors
