console.log("The Villupuram Run Platformer: Millionaire Quiz Version loaded");

const DEFAULT_CONFIG = {
  physics: {
    gravity: 2250,
    jumpVelocity: -1050,
    moveAcceleration: 4200,
    maxMoveSpeed: 520,
    groundFriction: 0.82,
    airControl: 0.72
  },

  level: {
    worldWidth: 12000,
    startX: 140,
    finishX: 11400,
    obstacleCount: 14,
    voteCount: 46,
    minObstacleGap: 650
  },

  player: {
    width: 120,
    height: 155,
    slideHeight: 92,
    image: "assets/characters/vijay.png",
    visualOffsetY: 38,
    hitboxPaddingX: 42,
    hitboxPaddingTop: 38,
    hitboxPaddingBottom: 32
  },

  audio: {
    src: "assets/audio/theme.mp3",
    enabled: true,
    volume: 0.45,
    loop: true,
    pauseWhenPaused: true,
    continueAfterGameOver: false
  },

  scoring: {
    distanceMultiplier: 0.08,
    voteValue: 20,
    finishBonus: 500
  },

  colors: {
    gold: "#ffd76a",
    darkGreen: "#102822",
    suit: "#050505",
    skin: "#c88755",
    scarf: "#f4d35e"
  },

  obstacles: Array.from({ length: 20 }, (_, i) => {
    const n = i + 1;
    const isAir = n % 5 === 0;

    return {
      name: `Obstacle ${n}`,
      type: isAir ? "air" : "ground",
      width: 120,
      height: isAir ? 82 : 120,
      color: "#e84d5b",
      label: String(n),
      image: `assets/obstacles/${n}.png`
    };
  }),

  collectible: {
    size: 36
  },

  debug: {
    showHitboxes: false
  }
};

const CONFIG = {
  ...DEFAULT_CONFIG,
  ...(window.GAME_CONFIG || {}),
  physics: { ...DEFAULT_CONFIG.physics, ...(window.GAME_CONFIG?.physics || {}) },
  level: { ...DEFAULT_CONFIG.level, ...(window.GAME_CONFIG?.level || {}) },
  player: { ...DEFAULT_CONFIG.player, ...(window.GAME_CONFIG?.player || {}) },
  audio: { ...DEFAULT_CONFIG.audio, ...(window.GAME_CONFIG?.audio || {}) },
  scoring: { ...DEFAULT_CONFIG.scoring, ...(window.GAME_CONFIG?.scoring || {}) },
  colors: { ...DEFAULT_CONFIG.colors, ...(window.GAME_CONFIG?.colors || {}) },
  collectible: { ...DEFAULT_CONFIG.collectible, ...(window.GAME_CONFIG?.collectible || {}) },
  debug: { ...DEFAULT_CONFIG.debug, ...(window.GAME_CONFIG?.debug || {}) }
};

const PLAYER_ANIMATIONS = {
  idle: {
    fps: 3,
    loop: true,
    frames: [
      "assets/player/idle/idle1.png",
      "assets/player/idle/idle2.png"
    ]
  },

  run: {
    fps: 10,
    loop: true,
    frames: [
      "assets/player/run/run1.png",
      "assets/player/run/run2.png",
      "assets/player/run/run3.png",
      "assets/player/run/run4.png"
    ]
  },

  jump: {
    fps: 1,
    loop: false,
    frames: [
      "assets/player/jump/jump1.png"
    ]
  },

  fall: {
    fps: 1,
    loop: false,
    frames: [
      "assets/player/fall/fall1.png"
    ]
  },

  slide: {
    fps: 8,
    loop: true,
    frames: [
      "assets/player/slide/slide1.png",
      "assets/player/slide/slide2.png"
    ]
  }
};

const QUIZ_QUESTIONS = [
  {
    question: "In Tamil Nadu politics, what does 'alliance arithmetic' usually mean?",
    options: [
      "Counting cinema tickets",
      "Combining vote shares and support bases",
      "Checking petrol price",
      "Counting memes"
    ],
    answer: 1
  },
  {
    question: "What is the classic election-season question in Tamil Nadu?",
    options: [
      "Who is aligning with whom?",
      "Who won the cricket toss?",
      "Who made sambar?",
      "Who bought new shoes?"
    ],
    answer: 0
  },
  {
    question: "Which symbol is famously associated with DMK?",
    options: [
      "Rising Sun",
      "Two Leaves",
      "Lotus",
      "Pressure Cooker"
    ],
    answer: 0
  },
  {
    question: "Which symbol is famously associated with AIADMK?",
    options: [
      "Hand",
      "Two Leaves",
      "Rising Sun",
      "Star"
    ],
    answer: 1
  },
  {
    question: "Which symbol became strongly linked with AMMK?",
    options: [
      "Mango",
      "Pressure Cooker",
      "Cycle",
      "Umbrella"
    ],
    answer: 1
  },
  {
    question: "When a political rumor goes viral, what is the smartest move?",
    options: [
      "Forward it instantly",
      "Check credible sources first",
      "Add fire emoji",
      "Make a fake poster"
    ],
    answer: 1
  },
  {
    question: "In Tamil Nadu political memes, what does 'wave' usually mean?",
    options: [
      "A beach wave",
      "A strong public mood",
      "A hand signal only",
      "A dance step"
    ],
    answer: 1
  },
  {
    question: "What is a 'swing voter'?",
    options: [
      "A voter who may change preference",
      "A voter on a playground swing",
      "A drummer",
      "A camera operator"
    ],
    answer: 0
  },
  {
    question: "What does 'cadre strength' mean?",
    options: [
      "Gym power",
      "Grassroots party workers",
      "Movie fans only",
      "College marks"
    ],
    answer: 1
  },
  {
    question: "Why might a new party avoid a major alliance?",
    options: [
      "To protect independent image and vote identity",
      "Because posters are expensive",
      "Because microphones are heavy",
      "Because rallies need chairs"
    ],
    answer: 0
  },
  {
    question: "If someone says 'Vijay is Illuminati' online, what is the safest interpretation?",
    options: [
      "Verified official fact",
      "Unverified internet rumor or meme",
      "Election Commission rule",
      "Official manifesto point"
    ],
    answer: 1
  },
  {
    question: "Why do cinema fan clubs matter in Tamil Nadu politics?",
    options: [
      "They can become ground-level mobilization networks",
      "They only sell popcorn",
      "They control weather",
      "They print exam marksheets"
    ],
    answer: 0
  },
  {
    question: "What does 'solo contest' mean?",
    options: [
      "A party contests without alliance partners",
      "A singer performs alone",
      "A single-player video game",
      "A one-person cricket team"
    ],
    answer: 0
  },
  {
    question: "What is the safest answer to a viral claim like 'X secretly met Y for alliance'?",
    options: [
      "Believe every caption",
      "Wait for verified reporting or official statement",
      "Trust only WhatsApp forwards",
      "Add dramatic BGM"
    ],
    answer: 1
  },
  {
    question: "In election memes, what does 'ground report' usually mean?",
    options: [
      "Actual local-level political mood",
      "Soil test report",
      "Cricket pitch report",
      "Road repair estimate"
    ],
    answer: 0
  },
  {
    question: "What is the most common reason parties debate seat-sharing?",
    options: [
      "Each party wants winnable constituencies",
      "They are choosing movie seats",
      "They are buying bus tickets",
      "They are designing shoes"
    ],
    answer: 0
  }
];

/* -------------------- DOM -------------------- */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("scoreText");
const votesText = document.getElementById("votesText");
const bestText = document.getElementById("bestText");
const finalText = document.getElementById("finalText");

const startScreen = document.getElementById("startScreen");
const pauseScreen = document.getElementById("pauseScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const errorBanner = document.getElementById("errorBanner");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const resumeBtn = document.getElementById("resumeBtn");
const jumpBtn = document.getElementById("jumpBtn");
const slideBtn = document.getElementById("slideBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const musicBtn = document.getElementById("musicBtn");

let bgMusic = document.getElementById("bgMusic");

if (!bgMusic) {
  bgMusic = document.createElement("audio");
  bgMusic.id = "bgMusic";
  bgMusic.loop = true;
  document.body.appendChild(bgMusic);
}

/* -------------------- MILLIONAIRE QUIZ UI -------------------- */

let quizOverlay = document.getElementById("quizOverlay");

if (!quizOverlay) {
  quizOverlay = document.createElement("section");
  quizOverlay.id = "quizOverlay";
  quizOverlay.className = "millionaire-overlay";

  quizOverlay.innerHTML = `
    <div class="millionaire-stage">
      <div class="millionaire-top">
        <div class="lifeline">50:50</div>
        <div class="lifeline">ASK</div>
        <div class="lifeline">POLL</div>
      </div>

      <div class="millionaire-title">Obstacle Escape Question</div>

      <div class="millionaire-question-wrap">
        <div id="quizQuestionText" class="millionaire-question">
          Question appears here
        </div>
      </div>

      <div id="quizOptions" class="millionaire-options"></div>

      <div id="quizFeedback" class="millionaire-feedback"></div>
    </div>
  `;

  document.getElementById("app").appendChild(quizOverlay);
}

const quizStyle = document.createElement("style");

quizStyle.textContent = `
  .millionaire-overlay {
    position: absolute;
    inset: 0;
    z-index: 9999;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background:
      radial-gradient(circle at center, rgba(30, 45, 140, 0.52), transparent 38%),
      linear-gradient(180deg, rgba(0, 0, 0, 0.82), rgba(0, 0, 0, 0.92));
    backdrop-filter: blur(7px);
  }

  .millionaire-overlay.visible {
    display: flex;
  }

  .millionaire-stage {
    width: min(980px, 96vw);
    color: white;
    font-family: Arial, Helvetica, sans-serif;
    text-align: center;
  }

  .millionaire-top {
    display: flex;
    justify-content: center;
    gap: 18px;
    margin-bottom: 26px;
  }

  .lifeline {
    width: 82px;
    height: 42px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    background: radial-gradient(circle at center, #1737a8, #06144f);
    border: 2px solid #d8b35c;
    color: #f8d77a;
    font-size: 13px;
    font-weight: 900;
    box-shadow: 0 0 18px rgba(80, 120, 255, 0.45);
  }

  .millionaire-title {
    display: inline-block;
    margin-bottom: 22px;
    padding: 8px 20px;
    border-radius: 999px;
    background: #050b2e;
    border: 2px solid #d8b35c;
    color: #f8d77a;
    font-size: 14px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .millionaire-question-wrap {
    position: relative;
    margin: 0 auto 18px;
    max-width: 900px;
  }

  .millionaire-question {
    position: relative;
    padding: 20px 34px;
    min-height: 76px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, #112e91, #061455);
    border: 3px solid #b7c7ff;
    border-radius: 18px;
    box-shadow:
      inset 0 0 18px rgba(255, 255, 255, 0.16),
      0 0 22px rgba(30, 70, 255, 0.45);
    font-size: clamp(17px, 2.2vw, 25px);
    font-weight: 800;
    line-height: 1.35;
    color: #ffffff;
  }

  .millionaire-question::before,
  .millionaire-question::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 140px;
    height: 3px;
    background: #b7c7ff;
  }

  .millionaire-question::before {
    right: 100%;
  }

  .millionaire-question::after {
    left: 100%;
  }

  .millionaire-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 22px;
    margin-top: 18px;
  }

  .millionaire-option {
    position: relative;
    min-height: 58px;
    padding: 12px 18px 12px 58px;
    border-radius: 999px;
    border: 2px solid #7f9dff;
    background: linear-gradient(180deg, #12349f, #06124c);
    color: white;
    text-align: left;
    font-size: clamp(15px, 1.8vw, 20px);
    font-weight: 800;
    cursor: pointer;
    box-shadow:
      inset 0 0 14px rgba(255, 255, 255, 0.12),
      0 0 14px rgba(30, 70, 255, 0.35);
  }

  .millionaire-option:hover {
    background: linear-gradient(180deg, #2046c9, #071a68);
  }

  .millionaire-option:disabled {
    cursor: not-allowed;
    opacity: 0.88;
  }

  .millionaire-letter {
    position: absolute;
    left: 21px;
    top: 50%;
    transform: translateY(-50%);
    color: #f8c24e;
    font-weight: 900;
  }

  .millionaire-option.correct {
    background: linear-gradient(180deg, #13a538, #08641f);
    border-color: #b9ffcc;
  }

  .millionaire-option.wrong {
    background: linear-gradient(180deg, #b21d2a, #6a0b13);
    border-color: #ffb3b3;
  }

  .millionaire-feedback {
    min-height: 32px;
    margin-top: 18px;
    font-size: 18px;
    font-weight: 900;
    color: #f8d77a;
    text-shadow: 0 2px 6px rgba(0,0,0,0.8);
  }

  @media (max-width: 700px) {
    .millionaire-options {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .millionaire-question::before,
    .millionaire-question::after {
      display: none;
    }

    .lifeline {
      width: 66px;
      height: 36px;
      font-size: 11px;
    }
  }
`;

document.head.appendChild(quizStyle);

/* -------------------- ASSETS -------------------- */

const assets = {
  playerAnimations: {},
  fallbackPlayer: new Image()
};

const obstacleImages = {};

let fallbackPlayerLoaded = false;
let musicEnabled = localStorage.getItem("villupuramRunMusic") !== "off";
let musicLoadFailed = false;

/* -------------------- GAME STATE -------------------- */

const keys = {
  left: false,
  right: false,
  down: false
};

let width = 0;
let height = 0;
let dpr = 1;
let groundY = 0;
let cameraX = 0;

let state = "start";
let lastTime = 0;
let elapsed = 0;
let score = 0;
let votes = 0;
let best = Number(localStorage.getItem("villupuramRunBestPlatformer") || 0);
let farthestX = 0;
let levelFinished = false;

let quizActive = false;
let activeQuizObstacle = null;
let lastQuizQuestionIndex = -1;

let obstacles = [];
let collectibles = [];
let particles = [];
let floatingTexts = [];
let clouds = [];
let animationFrameId = null;

const player = {
  x: CONFIG.level.startX,
  y: 0,
  vx: 0,
  vy: 0,
  width: CONFIG.player.width,
  height: CONFIG.player.height,
  normalHeight: CONFIG.player.height,
  slideHeight: CONFIG.player.slideHeight,
  grounded: true,
  facing: 1,
  state: "idle",
  previousState: "idle",
  animationTimer: 0,
  animationFrameIndex: 0
};

/* -------------------- HELPERS -------------------- */

function showMessage(message) {
  if (!errorBanner) return;

  errorBanner.textContent = message;
  errorBanner.classList.add("visible");

  clearTimeout(showMessage.timer);

  showMessage.timer = setTimeout(() => {
    errorBanner.classList.remove("visible");
  }, 5000);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/* -------------------- LOAD ASSETS -------------------- */

function loadAssets() {
  loadPlayerAnimations();
  loadFallbackPlayer();
  loadObstacleImages();
}

function loadPlayerAnimations() {
  let totalFrames = 0;
  let loadedFrames = 0;
  let failedFrames = 0;

  for (const [stateName, animation] of Object.entries(PLAYER_ANIMATIONS)) {
    assets.playerAnimations[stateName] = [];

    for (const src of animation.frames) {
      totalFrames++;

      const img = new Image();

      img.onload = () => {
        loadedFrames++;

        if (loadedFrames + failedFrames === totalFrames) {
          if (failedFrames > 0) {
            showMessage("Some player animation frames are missing. Check assets/player folders.");
          }

          render();
        }
      };

      img.onerror = () => {
        failedFrames++;
        console.warn("Missing player animation frame:", src);

        if (loadedFrames + failedFrames === totalFrames) {
          if (loadedFrames === 0) {
            showMessage("No animation frames found. Using fallback vijay.png.");
          } else {
            showMessage("Some player animation frames are missing. Check assets/player folders.");
          }

          render();
        }
      };

      img.src = src;
      assets.playerAnimations[stateName].push(img);
    }
  }
}

function loadFallbackPlayer() {
  assets.fallbackPlayer.onload = () => {
    fallbackPlayerLoaded = true;
    render();
  };

  assets.fallbackPlayer.onerror = () => {
    fallbackPlayerLoaded = false;
  };

  assets.fallbackPlayer.src = CONFIG.player.image;
}

function loadObstacleImages() {
  for (const obstacle of CONFIG.obstacles) {
    if (!obstacle.image || obstacleImages[obstacle.image]) continue;

    const img = new Image();

    img.onload = () => {
      render();
    };

    img.onerror = () => {
      console.warn("Missing obstacle image:", obstacle.image);
    };

    img.src = obstacle.image;
    obstacleImages[obstacle.image] = img;
  }
}

/* -------------------- AUDIO -------------------- */

function setupAudio() {
  if (!CONFIG.audio.enabled) {
    musicEnabled = false;
  }

  bgMusic.src = CONFIG.audio.src;
  bgMusic.loop = CONFIG.audio.loop;
  bgMusic.volume = CONFIG.audio.volume;
  bgMusic.preload = "auto";

  bgMusic.addEventListener("error", () => {
    musicLoadFailed = true;
    updateMusicButton();
    showMessage("theme.mp3 not found. Put it in assets/audio/theme.mp3");
  });

  bgMusic.addEventListener("canplaythrough", () => {
    musicLoadFailed = false;
    updateMusicButton();
  });

  updateMusicButton();
}

function startMusic() {
  if (!CONFIG.audio.enabled || !musicEnabled || musicLoadFailed) {
    updateMusicButton();
    return;
  }

  bgMusic.volume = CONFIG.audio.volume;
  bgMusic.loop = CONFIG.audio.loop;

  const playPromise = bgMusic.play();

  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => updateMusicButton("Tap Music"));
  }

  updateMusicButton();
}

function pauseMusic() {
  bgMusic.pause();
  updateMusicButton();
}

function toggleMusic() {
  if (!CONFIG.audio.enabled || musicLoadFailed) {
    showMessage("No music loaded. Check assets/audio/theme.mp3");
    return;
  }

  musicEnabled = !musicEnabled;
  localStorage.setItem("villupuramRunMusic", musicEnabled ? "on" : "off");

  if (musicEnabled) {
    startMusic();
  } else {
    pauseMusic();
  }

  updateMusicButton();
}

function updateMusicButton(customText) {
  if (!musicBtn) return;

  if (!CONFIG.audio.enabled) {
    musicBtn.textContent = "🔇 Music Off";
    musicBtn.classList.add("off");
    return;
  }

  if (musicLoadFailed) {
    musicBtn.textContent = "⚠️ No Music";
    musicBtn.classList.add("off");
    return;
  }

  if (customText) {
    musicBtn.textContent = `🔊 ${customText}`;
    musicBtn.classList.remove("off");
    return;
  }

  if (musicEnabled) {
    musicBtn.textContent = bgMusic.paused ? "🔊 Music" : "🔊 Playing";
    musicBtn.classList.remove("off");
  } else {
    musicBtn.textContent = "🔇 Muted";
    musicBtn.classList.add("off");
  }
}

/* -------------------- SETUP -------------------- */

function resizeCanvas() {
  dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  width = window.innerWidth;
  height = window.innerHeight;
  groundY = Math.floor(height * 0.72);

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  player.y = groundY - player.height;
  updateCamera();
}

function resetGame() {
  elapsed = 0;
  score = 0;
  votes = 0;
  farthestX = CONFIG.level.startX;
  levelFinished = false;

  quizActive = false;
  activeQuizObstacle = null;
  quizOverlay.classList.remove("visible");

  cameraX = 0;

  obstacles = buildRandomObstacles();
  collectibles = buildRandomVotes();
  particles = [];
  floatingTexts = [];

  player.x = CONFIG.level.startX;
  player.y = groundY - player.normalHeight;
  player.vx = 0;
  player.vy = 0;
  player.height = player.normalHeight;
  player.grounded = true;
  player.facing = 1;

  setPlayerState("idle");

  clouds = Array.from({ length: 8 }, () => ({
    x: Math.random() * CONFIG.level.worldWidth,
    y: 70 + Math.random() * height * 0.25,
    scale: 0.65 + Math.random() * 0.95,
    alpha: 0.16 + Math.random() * 0.18
  }));

  updateHud();
}

function buildRandomObstacles() {
  const result = [];

  const count = CONFIG.level.obstacleCount;
  const startX = 1200;
  const endX = CONFIG.level.finishX - 900;
  const spacing = (endX - startX) / Math.max(1, count - 1);

  for (let i = 0; i < count; i++) {
    const template = CONFIG.obstacles[Math.floor(Math.random() * CONFIG.obstacles.length)];
    const x = startX + i * spacing;

    const y = template.type === "air"
      ? groundY - player.normalHeight - 24
      : groundY - template.height;

    result.push({
      ...template,
      x,
      y,
      cleared: false,
      disabled: false
    });
  }

  return result;
}

function buildRandomVotes() {
  const result = [];

  for (let i = 0; i < CONFIG.level.voteCount; i++) {
    const x = 450 + Math.random() * (CONFIG.level.finishX - 700);
    const y = Math.random() > 0.5
      ? groundY - 190 - Math.random() * 90
      : groundY - 120 - Math.random() * 50;

    result.push({
      x,
      y,
      size: CONFIG.collectible.size,
      collected: false,
      spin: Math.random() * Math.PI * 2
    });
  }

  return result;
}

/* -------------------- START / PAUSE / END -------------------- */

function startGame() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  resetGame();

  state = "running";
  startScreen.classList.remove("visible");
  pauseScreen.classList.remove("visible");
  gameOverScreen.classList.remove("visible");

  startMusic();

  lastTime = performance.now();
  animationFrameId = requestAnimationFrame(loop);
}

function restartGame() {
  startGame();
}

function togglePause() {
  if (quizActive) return;

  if (state === "running") {
    state = "paused";
    pauseScreen.classList.add("visible");

    if (CONFIG.audio.pauseWhenPaused) {
      pauseMusic();
    }
  } else if (state === "paused") {
    state = "running";
    pauseScreen.classList.remove("visible");

    if (CONFIG.audio.pauseWhenPaused) {
      startMusic();
    }

    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(loop);
  }
}

function finishLevel() {
  if (levelFinished) return;

  levelFinished = true;
  score += CONFIG.scoring.finishBonus;

  floatingTexts.push({
    text: "+500 Finish",
    x: player.x,
    y: player.y - 30,
    vy: -50,
    life: 1.2
  });

  setTimeout(() => {
    if (state === "running") {
      endGame(true);
    }
  }, 700);
}

function endGame(finished = false) {
  state = "over";

  quizActive = false;
  activeQuizObstacle = null;
  quizOverlay.classList.remove("visible");

  keys.left = false;
  keys.right = false;
  keys.down = false;

  if (!CONFIG.audio.continueAfterGameOver) {
    pauseMusic();
  }

  if (score > best) {
    best = score;
    localStorage.setItem("villupuramRunBestPlatformer", String(best));
  }

  updateHud();

  finalText.innerHTML = `
    <strong>${finished ? "Finished!" : "Game Over"}</strong><br>
    <strong>Score:</strong> ${score}<br>
    <strong>Votes:</strong> ${votes}<br>
    <strong>Distance:</strong> ${Math.floor(farthestX)}<br>
    <strong>Best:</strong> ${best}
  `;

  gameOverScreen.classList.add("visible");
}

function updateHud() {
  scoreText.textContent = Math.floor(score);
  votesText.textContent = votes;
  bestText.textContent = best;
}

/* -------------------- MAIN LOOP -------------------- */

function loop(now) {
  if (state === "start" || state === "paused" || state === "over") return;

  if (state === "quiz") {
    render();
    animationFrameId = requestAnimationFrame(loop);
    return;
  }

  if (state !== "running") return;

  const dt = Math.min(0.033, (now - lastTime) / 1000 || 0);
  lastTime = now;

  update(dt);
  render();

  animationFrameId = requestAnimationFrame(loop);
}

function update(dt) {
  elapsed += dt;

  updatePlayer(dt);
  updatePlayerAnimation(dt);
  updateCollectibles(dt);
  updateParticles(dt);
  updateCamera();

  farthestX = Math.max(farthestX, player.x);
  score = Math.floor(farthestX * CONFIG.scoring.distanceMultiplier) + votes * CONFIG.scoring.voteValue;

  if (player.x >= CONFIG.level.finishX) {
    finishLevel();
  }

  updateHud();
  updateMusicButton();
}

/* -------------------- PLAYER -------------------- */

function updatePlayer(dt) {
  const movingLeft = keys.left && !keys.right;
  const movingRight = keys.right && !keys.left;
  const control = player.grounded ? 1 : CONFIG.physics.airControl;

  if (movingLeft) {
    player.vx -= CONFIG.physics.moveAcceleration * control * dt;
    player.facing = -1;
  }

  if (movingRight) {
    player.vx += CONFIG.physics.moveAcceleration * control * dt;
    player.facing = 1;
  }

  if (!movingLeft && !movingRight && player.grounded) {
    player.vx *= CONFIG.physics.groundFriction;

    if (Math.abs(player.vx) < 8) {
      player.vx = 0;
    }
  }

  player.vx = clamp(player.vx, -CONFIG.physics.maxMoveSpeed, CONFIG.physics.maxMoveSpeed);

  const wantsSlide = keys.down && player.grounded;

  if (wantsSlide) {
    player.height = player.normalHeight;
    player.vx *= 0.94;
  } else {
    player.height = player.normalHeight;
  }

  player.x += player.vx * dt;
  player.x = clamp(player.x, 20, CONFIG.level.worldWidth - player.width - 20);

  player.vy += CONFIG.physics.gravity * dt;
  player.y += player.vy * dt;

  if (player.y + player.height >= groundY) {
    if (!player.grounded) {
      spawnDust(player.x + player.width / 2, groundY, 12);
    }

    player.y = groundY - player.height;
    player.vy = 0;
    player.grounded = true;
  } else {
    player.grounded = false;
  }

  choosePlayerState();

  for (const obstacle of obstacles) {
    if (obstacle.disabled) continue;

    if (rectsOverlap(getPlayerHitbox(), getObstacleHitbox(obstacle))) {
      triggerQuiz(obstacle);
      return;
    }
  }
}

function choosePlayerState() {
  const speedX = Math.abs(player.vx);

  if (keys.down && player.grounded) {
    setPlayerState("slide");
    return;
  }

  if (!player.grounded && player.vy < -60) {
    setPlayerState("jump");
    return;
  }

  if (!player.grounded && player.vy >= -60) {
    setPlayerState("fall");
    return;
  }

  if (speedX > 35) {
    setPlayerState("run");
    return;
  }

  setPlayerState("idle");
}

function setPlayerState(newState) {
  if (player.state === newState) return;

  player.previousState = player.state;
  player.state = newState;
  player.animationTimer = 0;
  player.animationFrameIndex = 0;
}

function updatePlayerAnimation(dt) {
  const animation = PLAYER_ANIMATIONS[player.state];

  if (!animation) return;

  player.animationTimer += dt;

  const frameCount = animation.frames.length;
  const rawFrame = Math.floor(player.animationTimer * animation.fps);

  if (animation.loop) {
    player.animationFrameIndex = rawFrame % frameCount;
  } else {
    player.animationFrameIndex = Math.min(rawFrame, frameCount - 1);
  }
}

function getCurrentPlayerImage() {
  const stateImages = assets.playerAnimations[player.state];

  if (stateImages && stateImages.length > 0) {
    const safeIndex = Math.min(player.animationFrameIndex, stateImages.length - 1);
    const img = stateImages[safeIndex];

    if (img && img.complete && img.naturalWidth > 0) {
      return img;
    }
  }

  const idleImages = assets.playerAnimations.idle;

  if (idleImages && idleImages.length > 0) {
    const img = idleImages[0];

    if (img && img.complete && img.naturalWidth > 0) {
      return img;
    }
  }

  if (fallbackPlayerLoaded && assets.fallbackPlayer.complete && assets.fallbackPlayer.naturalWidth > 0) {
    return assets.fallbackPlayer;
  }

  return null;
}

function jump() {
  if (state === "start") {
    startGame();
    return;
  }

  if (state !== "running") return;
  if (quizActive) return;
  if (!player.grounded) return;

  player.vy = CONFIG.physics.jumpVelocity;
  player.grounded = false;
  setPlayerState("jump");
  spawnDust(player.x + 12, groundY, 8);
}

/* -------------------- QUIZ SYSTEM -------------------- */

function triggerQuiz(obstacle) {
  if (quizActive || state !== "running") return;

  quizActive = true;
  activeQuizObstacle = obstacle;
  state = "quiz";

  keys.left = false;
  keys.right = false;
  keys.down = false;

  player.vx = 0;
  player.vy = 0;

  pauseMusic();

  spawnBurst(
    player.x + player.width / 2,
    player.y + player.height / 2,
    "#ffd76a",
    18
  );

  showQuizQuestion();
}

function getRandomQuizQuestion() {
  if (QUIZ_QUESTIONS.length === 1) {
    lastQuizQuestionIndex = 0;
    return QUIZ_QUESTIONS[0];
  }

  let index = Math.floor(Math.random() * QUIZ_QUESTIONS.length);

  while (index === lastQuizQuestionIndex) {
    index = Math.floor(Math.random() * QUIZ_QUESTIONS.length);
  }

  lastQuizQuestionIndex = index;
  return QUIZ_QUESTIONS[index];
}

function showQuizQuestion() {
  const question = getRandomQuizQuestion();

  const questionText = document.getElementById("quizQuestionText");
  const optionsBox = document.getElementById("quizOptions");
  const feedback = document.getElementById("quizFeedback");

  questionText.textContent = question.question;
  optionsBox.innerHTML = "";
  feedback.textContent = "";

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "millionaire-option";
    button.innerHTML = `<span class="millionaire-letter">${String.fromCharCode(65 + index)}:</span> ${option}`;

    button.addEventListener("pointerdown", event => {
      event.preventDefault();
      answerQuiz(index, question, button);
    });

    optionsBox.appendChild(button);
  });

  quizOverlay.classList.add("visible");
}

function answerQuiz(selectedIndex, question, selectedButton) {
  const feedback = document.getElementById("quizFeedback");
  const optionsBox = document.getElementById("quizOptions");
  const buttons = optionsBox.querySelectorAll("button");

  buttons.forEach(button => {
    button.disabled = true;
  });

  const correct = selectedIndex === question.answer;

  buttons[question.answer].classList.add("correct");

  if (!correct) {
    selectedButton.classList.add("wrong");
  }

  if (correct) {
    feedback.textContent = "Correct! Vijay escapes and continues.";

    setTimeout(() => {
      continueAfterQuiz();
    }, 850);
  } else {
    feedback.textContent = `Wrong! Correct answer: ${question.options[question.answer]}`;

    setTimeout(() => {
      quizOverlay.classList.remove("visible");
      quizActive = false;
      activeQuizObstacle = null;
      endGame(false);
    }, 1500);
  }
}

function continueAfterQuiz() {
  quizOverlay.classList.remove("visible");

  if (activeQuizObstacle) {
    activeQuizObstacle.disabled = true;
    activeQuizObstacle.cleared = true;
  }

  player.x -= 120 * player.facing;
  player.x = clamp(player.x, 20, CONFIG.level.worldWidth - player.width - 20);

  player.y = groundY - player.normalHeight;
  player.height = player.normalHeight;
  player.vx = 0;
  player.vy = 0;
  player.grounded = true;

  floatingTexts.push({
    text: "+Quiz Save",
    x: player.x + 20,
    y: player.y - 18,
    vy: -50,
    life: 0.95
  });

  quizActive = false;
  activeQuizObstacle = null;
  state = "running";

  if (CONFIG.audio.pauseWhenPaused) {
    startMusic();
  }

  lastTime = performance.now();
}

/* -------------------- COLLECTIBLES / PARTICLES -------------------- */

function updateCollectibles(dt) {
  for (const item of collectibles) {
    item.spin += dt * 8;

    if (!item.collected && circleRectOverlap(item, getPlayerHitbox())) {
      item.collected = true;
      votes += 1;

      spawnBurst(item.x, item.y, CONFIG.colors.gold, 20);

      floatingTexts.push({
        text: "+1 Vote",
        x: item.x,
        y: item.y - 18,
        vy: -50,
        life: 0.85
      });
    }
  }
}

function updateParticles(dt) {
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 900 * dt;
    p.life -= dt;
    p.size *= 0.985;
  }

  for (const text of floatingTexts) {
    text.y += text.vy * dt;
    text.life -= dt;
  }

  particles = particles.filter(p => p.life > 0 && p.size > 0.5);
  floatingTexts = floatingTexts.filter(text => text.life > 0);
}

function spawnBurst(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const force = 80 + Math.random() * 220;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * force,
      vy: Math.sin(angle) * force,
      size: 3 + Math.random() * 6,
      color,
      life: 0.45 + Math.random() * 0.45
    });
  }
}

function spawnDust(x, y, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x + Math.random() * 24,
      y: y - 4,
      vx: -70 - Math.random() * 170,
      vy: -40 - Math.random() * 70,
      size: 4 + Math.random() * 7,
      color: "rgba(247, 215, 148, 0.82)",
      life: 0.28 + Math.random() * 0.25
    });
  }
}

/* -------------------- CAMERA -------------------- */

function updateCamera() {
  const target = player.x - width * 0.35;
  cameraX += (target - cameraX) * 0.16;
  cameraX = clamp(cameraX, 0, Math.max(0, CONFIG.level.worldWidth - width));
}

/* -------------------- COLLISION -------------------- */

function getPlayerHitbox() {
  return {
    x: player.x + CONFIG.player.hitboxPaddingX,
    y: player.y + CONFIG.player.hitboxPaddingTop,
    width: player.width - CONFIG.player.hitboxPaddingX * 2,
    height: player.height - CONFIG.player.hitboxPaddingTop - CONFIG.player.hitboxPaddingBottom
  };
}

function getObstacleHitbox(obstacle) {
  const padX = obstacle.width * 0.40;
  const padTop = obstacle.height * 0.34;
  const padBottom = obstacle.height * 0.38;

  return {
    x: obstacle.x + padX,
    y: obstacle.y + padTop,
    width: obstacle.width - padX * 2,
    height: obstacle.height - padTop - padBottom
  };
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function circleRectOverlap(circle, rect) {
  const radius = circle.size / 2;
  const closestX = clamp(circle.x, rect.x, rect.x + rect.width);
  const closestY = clamp(circle.y, rect.y, rect.y + rect.height);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;

  return dx * dx + dy * dy < radius * radius;
}

/* -------------------- RENDER -------------------- */

function render() {
  ctx.save();

  drawSky();
  drawParallax();
  drawGround();
  drawFinishLine();
  drawCollectibles();
  drawObstacles();
  drawPlayer();
  drawParticles();

  if (CONFIG.debug.showHitboxes) {
    drawHitboxes();
  }

  ctx.restore();
}

function drawSky() {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);

  gradient.addColorStop(0, "#171030");
  gradient.addColorStop(0.38, "#32205a");
  gradient.addColorStop(0.7, "#c76d61");
  gradient.addColorStop(1, "#f7d794");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "#fff3c4";
  ctx.shadowColor = "#fff3c4";
  ctx.shadowBlur = 35;
  ctx.beginPath();
  ctx.arc(width * 0.78, height * 0.16, 45, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.34;
  ctx.fillStyle = "#fff";

  for (let i = 0; i < 70; i++) {
    const x = (i * 137 + 45 - cameraX * 0.08) % width;
    const y = (i * 71 + 28) % Math.max(190, height * 0.42);

    ctx.fillRect(x, y, 1.6, 1.6);
  }

  ctx.restore();
}

function drawParallax() {
  drawClouds();

  const mountainOffset = -(cameraX * 0.22) % width;
  drawMountains(mountainOffset, groundY - 250, "#211839", 0.72);
  drawMountains(mountainOffset + width, groundY - 250, "#211839", 0.72);

  const hillOffset = -(cameraX * 0.45) % width;
  drawHills(hillOffset, groundY - 120, "#18332e", 0.96);
  drawHills(hillOffset + width, groundY - 120, "#18332e", 0.96);
}

function drawClouds() {
  for (const cloud of clouds) {
    const screenX = cloud.x - cameraX * 0.18;

    if (screenX < -220 || screenX > width + 220) continue;

    ctx.save();
    ctx.globalAlpha = cloud.alpha;
    ctx.fillStyle = "#fff";
    ctx.translate(screenX, cloud.y);
    ctx.scale(cloud.scale, cloud.scale);
    roundedCloud();
    ctx.restore();
  }
}

function roundedCloud() {
  ctx.beginPath();
  ctx.arc(0, 18, 22, 0, Math.PI * 2);
  ctx.arc(28, 10, 28, 0, Math.PI * 2);
  ctx.arc(64, 18, 23, 0, Math.PI * 2);
  ctx.rect(-5, 18, 76, 24);
  ctx.fill();
}

function drawMountains(offset, baseY, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.moveTo(offset, groundY);
  ctx.lineTo(offset + width * 0.14, baseY + 75);
  ctx.lineTo(offset + width * 0.25, groundY);
  ctx.lineTo(offset + width * 0.42, baseY + 20);
  ctx.lineTo(offset + width * 0.58, groundY);
  ctx.lineTo(offset + width * 0.76, baseY + 65);
  ctx.lineTo(offset + width, groundY);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawHills(offset, y, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.ellipse(offset + width * 0.28, y + 120, width * 0.45, 155, 0, 0, Math.PI * 2);
  ctx.ellipse(offset + width * 0.78, y + 145, width * 0.52, 175, 0, 0, Math.PI * 2);
  ctx.rect(offset, y + 120, width, 260);
  ctx.fill();

  ctx.restore();
}

function drawGround() {
  const grassTopHeight = 26;
  const soilY = groundY + grassTopHeight;
  const scrollX = cameraX % 48;

  ctx.fillStyle = "#8b5a2b";
  ctx.fillRect(0, groundY, width, height - groundY);

  ctx.fillStyle = "#6b3f1f";
  ctx.fillRect(0, soilY + 28, width, height - soilY - 28);

  ctx.fillStyle = "#2fa53a";
  ctx.fillRect(0, groundY, width, grassTopHeight);

  ctx.fillStyle = "#7ee35d";
  ctx.fillRect(0, groundY, width, 7);

  ctx.fillStyle = "#1f7d2d";
  for (let x = -24 - scrollX; x < width + 48; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, groundY + 7);
    ctx.lineTo(x + 12, groundY + 24);
    ctx.lineTo(x + 24, groundY + 7);
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(72, 39, 17, 0.45)";
  ctx.lineWidth = 2;

  for (let x = -scrollX; x < width + 48; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, soilY);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = soilY + 24; y < height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "#c78943";
  ctx.lineWidth = 3;

  for (let y = soilY + 14; y < height; y += 34) {
    ctx.beginPath();

    for (let x = -30 - scrollX; x < width + 60; x += 30) {
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 15, y + 8, x + 30, y);
    }

    ctx.stroke();
  }
}

function drawFinishLine() {
  const x = CONFIG.level.finishX - cameraX;

  if (x < -80 || x > width + 80) return;

  ctx.save();

  ctx.fillStyle = "#ffd76a";
  ctx.fillRect(x, groundY - 220, 10, 220);

  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.roundRect(x + 10, groundY - 220, 115, 58, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#111";
  ctx.font = "900 18px Arial";
  ctx.textAlign = "center";
  ctx.fillText("FINISH", x + 67, groundY - 184);

  ctx.restore();
}

function drawPlayer() {
  const screenX = player.x - cameraX;

  drawCharacterShadow(screenX, groundY);

  const img = getCurrentPlayerImage();

  if (img) {
    drawPlayerImage(img, screenX);
  } else {
    drawFallbackPlayer(screenX);
  }
}

function drawPlayerImage(img, screenX) {
  const drawY = player.y + (CONFIG.player.visualOffsetY || 0);

  ctx.save();

  ctx.translate(screenX + player.width / 2, drawY + player.height / 2);
  ctx.scale(player.facing, 1);
  ctx.translate(-player.width / 2, -player.height / 2);

  ctx.shadowColor = "rgba(0, 0, 0, 0.30)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  ctx.drawImage(img, 0, 0, player.width, player.height);

  ctx.restore();
}

function drawCharacterShadow(screenX, y) {
  ctx.save();
  ctx.globalAlpha = 0.20;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(screenX + player.width / 2, y + 4, 44, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFallbackPlayer(screenX) {
  const x = screenX;
  const y = player.y + (CONFIG.player.visualOffsetY || 0);

  ctx.save();

  ctx.fillStyle = CONFIG.colors.suit;
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.roundRect(x + 25, y + 48, 58, 68, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = CONFIG.colors.skin;
  ctx.beginPath();
  ctx.roundRect(x + 32, y + 5, 46, 48, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.roundRect(x + 22, y, 66, 25, 14);
  ctx.fill();

  ctx.fillStyle = "#f4d35e";
  ctx.beginPath();
  ctx.roundRect(x + 21, y + 52, 70, 15, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#111";
  ctx.font = "900 10px Arial";
  ctx.fillText("TVK", x + 46, y + 64);

  ctx.restore();
}

function drawObstacles() {
  for (const obstacle of obstacles) {
    if (obstacle.disabled) continue;

    const screenX = obstacle.x - cameraX;

    if (screenX < -220 || screenX > width + 220) continue;

    const img = obstacle.image ? obstacleImages[obstacle.image] : null;

    ctx.save();

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;
      ctx.drawImage(img, screenX, obstacle.y, obstacle.width, obstacle.height);
      ctx.restore();
      continue;
    }

    ctx.fillStyle = obstacle.color || "#e84d5b";
    ctx.strokeStyle = "rgba(255,255,255,0.88)";
    ctx.lineWidth = 3;
    ctx.shadowColor = obstacle.color || "#e84d5b";
    ctx.shadowBlur = 18;

    ctx.beginPath();
    ctx.roundRect(screenX, obstacle.y, obstacle.width, obstacle.height, 20);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#111";
    ctx.font = "900 20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      obstacle.label || "OBS",
      screenX + obstacle.width / 2,
      obstacle.y + obstacle.height / 2
    );

    ctx.restore();
  }
}

function drawCollectibles() {
  for (const item of collectibles) {
    if (item.collected) continue;

    const screenX = item.x - cameraX;

    if (screenX < -100 || screenX > width + 100) continue;

    const radius = item.size / 2;
    const squash = 0.72 + Math.abs(Math.sin(item.spin)) * 0.28;

    ctx.save();
    ctx.translate(screenX, item.y);
    ctx.scale(squash, 1);

    ctx.shadowColor = CONFIG.colors.gold;
    ctx.shadowBlur = 22;
    ctx.fillStyle = CONFIG.colors.gold;
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#111";
    ctx.font = "900 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("+1", 0, 1);

    ctx.restore();
  }
}

function drawParticles() {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x - cameraX, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  for (const text of floatingTexts) {
    ctx.save();
    ctx.globalAlpha = clamp(text.life, 0, 1);
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 4;
    ctx.font = "900 18px Arial";
    ctx.textAlign = "center";
    ctx.strokeText(text.text, text.x - cameraX, text.y);
    ctx.fillText(text.text, text.x - cameraX, text.y);
    ctx.restore();
  }
}

function drawHitboxes() {
  const p = getPlayerHitbox();

  ctx.save();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "lime";
  ctx.strokeRect(p.x - cameraX, p.y, p.width, p.height);

  ctx.strokeStyle = "red";

  for (const obstacle of obstacles) {
    if (obstacle.disabled) continue;

    const box = getObstacleHitbox(obstacle);
    ctx.strokeRect(box.x - cameraX, box.y, box.width, box.height);
  }

  ctx.restore();
}

/* -------------------- ROUND RECT FALLBACK -------------------- */

if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);

    this.beginPath();
    this.moveTo(x + radius, y);
    this.arcTo(x + w, y, x + w, y + h, radius);
    this.arcTo(x + w, y + h, x, y + h, radius);
    this.arcTo(x, y + h, x, y, radius);
    this.arcTo(x, y, x + w, y, radius);
    this.closePath();

    return this;
  };
}

/* -------------------- INPUT -------------------- */

function setButtonHeld(button, keyName) {
  if (!button) return;

  const hold = event => {
    event.preventDefault();

    if (!quizActive && state === "running") {
      keys[keyName] = true;
    }
  };

  const release = event => {
    event.preventDefault();
    keys[keyName] = false;
  };

  button.addEventListener("pointerdown", hold);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
}

function fastTap(button, action) {
  if (!button) return;

  button.addEventListener("pointerdown", event => {
    event.preventDefault();
    action();
  });
}

function initGame() {
  loadAssets();
  resizeCanvas();
  setupAudio();
  resetGame();
  render();

  fastTap(startBtn, startGame);
  fastTap(restartBtn, restartGame);
  fastTap(resumeBtn, togglePause);
  fastTap(jumpBtn, jump);

  fastTap(slideBtn, () => {
    if (quizActive || state !== "running") return;

    keys.down = true;

    setTimeout(() => {
      keys.down = false;
    }, 300);
  });

  fastTap(musicBtn, toggleMusic);

  setButtonHeld(leftBtn, "left");
  setButtonHeld(rightBtn, "right");

  window.addEventListener("resize", () => {
    resizeCanvas();
    render();
  });

  document.addEventListener("keydown", event => {
    if (quizActive) return;

    if (event.code === "ArrowLeft" || event.code === "KeyA") {
      event.preventDefault();
      keys.left = true;
    }

    if (event.code === "ArrowRight" || event.code === "KeyD") {
      event.preventDefault();
      keys.right = true;
    }

    if (event.code === "ArrowDown" || event.code === "KeyS") {
      event.preventDefault();
      keys.down = true;
    }

    if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") {
      event.preventDefault();
      jump();
    }

    if (event.code === "KeyP" || event.code === "Escape") {
      event.preventDefault();
      togglePause();
    }

    if (event.code === "KeyM") {
      event.preventDefault();
      toggleMusic();
    }
  });

  document.addEventListener("keyup", event => {
    if (event.code === "ArrowLeft" || event.code === "KeyA") {
      event.preventDefault();
      keys.left = false;
    }

    if (event.code === "ArrowRight" || event.code === "KeyD") {
      event.preventDefault();
      keys.right = false;
    }

    if (event.code === "ArrowDown" || event.code === "KeyS") {
      event.preventDefault();
      keys.down = false;
    }
  });

  console.log("The Villupuram Run Platformer: Millionaire quiz version ready");
}

initGame();
