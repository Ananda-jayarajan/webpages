
/* -------------------- comment -------------------- */
console.log("Thalapathy Run: fixed 3-phase story mode loaded");

const DEFAULT_CONFIG = {
  title: "Thalapathy Run",

  physics: {
    gravity: 2250,
    jumpVelocity: -1050,
    moveAcceleration: 4200,
    maxMoveSpeed: 520,
    groundFriction: 0.82,
    airControl: 0.72
  },

  level: {
    worldWidth: 15000,
    startX: 140,
    finishX: 14600,
    voteCount: 60
  },

  player: {
    width: 120,
    height: 155,
    slideHeight: 82,
    image: "assets/characters/vijay.png",
    visualOffsetY: 38,
    hitboxPaddingX: 42,
    hitboxPaddingTop: 38,
    hitboxPaddingBottom: 32
  },

  audio: {
    enabled: true,
    volume: 0.45,
    loop: true,
    pauseWhenPaused: true,
    continueAfterGameOver: false,
    playlist: [
      { name: "Theme", src: "assets/audio/theme.mp3" }
    ]
  },

  scoring: {
    distanceMultiplier: 0.08,
    voteValue: 20,
    finishBonus: 500
  },

  colors: {
    gold: "#ffd76a"
  },

  collectible: {
    size: 36
  },

  debug: {
    showHitboxes: false
  },

  phases: [
    {
      id: 1,
      name: "Cinema Career",
      shortName: "Cinema",
      subtitle: "Survive fame, fan wars, media heat, and cinema politics.",
      startX: 0,
      endX: 5000,
      tokenName: "Fans",
      theme: "cinema",
      musicIndex: 0,
      obstacleCount: 9,
      obstacles: [
        { name: "Ajith Fan Storm", label: "AK", type: "ground", width: 145, height: 125, behavior: "bounce" },
        { name: "Rajini Spotlight", label: "SPOT", type: "air", width: 160, height: 92, behavior: "float" },
        { name: "Box Office Bomb", label: "BO", type: "ground", width: 120, height: 120, behavior: "pulse" },
        { name: "Troll Review Cloud", label: "TROLL", type: "air", width: 170, height: 90, behavior: "wave" }
      ]
    },
    {
      id: 2,
      name: "Political Rise",
      shortName: "Politics",
      subtitle: "Handle alliances, vote splits, debates, and support letters.",
      startX: 5000,
      endX: 10000,
      tokenName: "Support Letters",
      theme: "campaign",
      musicIndex: 0,
      obstacleCount: 10,
      obstacles: [
        { name: "Alliance Table", label: "TALK", type: "ground", width: 175, height: 110, behavior: "stretch" },
        { name: "Seat Sharing Scale", label: "SEATS", type: "ground", width: 155, height: 125, behavior: "bounce" },
        { name: "Debate Anchor Trap", label: "LIVE", type: "ground", width: 150, height: 115, behavior: "flash" },
        { name: "Meme Tornado", label: "MEME", type: "air", width: 140, height: 130, behavior: "wave" }
      ]
    },
    {
      id: 3,
      name: "Government Era",
      shortName: "Govt",
      subtitle: "Deliver welfare, manage pressure, and survive governance.",
      startX: 10000,
      endX: 14600,
      tokenName: "Welfare Tokens",
      theme: "government",
      musicIndex: 0,
      obstacleCount: 9,
      obstacles: [
        { name: "Budget File Mountain", label: "BUDGET", type: "ground", width: 155, height: 145, behavior: "static" },
        { name: "Bureaucracy Maze", label: "FILES", type: "ground", width: 170, height: 120, behavior: "stretch" },
        { name: "Protest Wave", label: "PROTEST", type: "ground", width: 180, height: 118, behavior: "wave" },
        { name: "Media Heat", label: "MEDIA", type: "air", width: 165, height: 92, behavior: "flash" }
      ]
    }
  ]
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
  debug: { ...DEFAULT_CONFIG.debug, ...(window.GAME_CONFIG?.debug || {}) },
  phases: Array.isArray(window.GAME_CONFIG?.phases) && window.GAME_CONFIG.phases.length > 0
    ? window.GAME_CONFIG.phases
    : DEFAULT_CONFIG.phases
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
    frames: ["assets/player/jump/jump1.png"]
  },

  fall: {
    fps: 1,
    loop: false,
    frames: ["assets/player/fall/fall1.png"]
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
    question: "In Tamil Nadu politics, what does alliance arithmetic usually mean?",
    options: [
      "Counting cinema tickets",
      "Combining vote shares and support bases",
      "Checking petrol price",
      "Counting memes"
    ],
    answer: 1
  },
  {
    question: "In Phase 1, what is Vijay mainly trying to survive?",
    options: [
      "Fan wars, reviews, media heat, and cinema politics",
      "Only traffic signals",
      "Only cricket commentary",
      "Only cooking contests"
    ],
    answer: 0
  },
  {
    question: "In Phase 2, why do alliance talks become dangerous?",
    options: [
      "Because every party wants winnable seats",
      "Because microphones are heavy",
      "Because posters have too many colors",
      "Because nobody likes tea"
    ],
    answer: 0
  },
  {
    question: "What does a support letter represent in the politics phase?",
    options: [
      "A path toward forming government",
      "A movie ticket",
      "A fan club ID card",
      "A cinema review"
    ],
    answer: 0
  },
  {
    question: "In Phase 3, what is the biggest challenge?",
    options: [
      "Governance pressure",
      "Choosing ringtone",
      "Buying popcorn",
      "Finding parking"
    ],
    answer: 0
  },
  {
    question: "What is the safest answer to a viral political claim?",
    options: [
      "Forward instantly",
      "Verify with credible reporting",
      "Add dramatic BGM",
      "Trust every meme"
    ],
    answer: 1
  },
  {
    question: "What does cadre strength usually mean?",
    options: [
      "Grassroots party workers",
      "Gym power",
      "Movie box office only",
      "College marks"
    ],
    answer: 0
  },
  {
    question: "What is a swing voter?",
    options: [
      "A voter who may change preference",
      "A voter on a playground swing",
      "A drummer",
      "A camera operator"
    ],
    answer: 0
  },
  {
    question: "What does solo contest mean?",
    options: [
      "A party contests without alliance partners",
      "A singer performs alone",
      "A single-player video game",
      "A one-person cricket team"
    ],
    answer: 0
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

const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const musicBtn = document.getElementById("musicBtn");
const nextSongBtn = document.getElementById("nextSongBtn");
const songNameText = document.getElementById("songNameText");

const phaseHudText = document.getElementById("phaseHudText");
const phaseBanner = document.getElementById("phaseBanner");
const phaseBannerLabel = document.getElementById("phaseBannerLabel");
const phaseBannerTitle = document.getElementById("phaseBannerTitle");
const phaseBannerSubtitle = document.getElementById("phaseBannerSubtitle");

const gameOverBadge = document.getElementById("gameOverBadge");
const gameOverTitle = document.getElementById("gameOverTitle");
const outroMediaBox = document.getElementById("outroMediaBox");
const outroVideo = document.getElementById("outroVideo");
const outroImage = document.getElementById("outroImage");

const introVideo = document.getElementById("introVideo");
const introSoundBtn = document.getElementById("introSoundBtn");

let bgMusic = document.getElementById("bgMusic");

if (!bgMusic) {
  bgMusic = document.createElement("audio");
  bgMusic.id = "bgMusic";
  bgMusic.loop = true;
  document.body.appendChild(bgMusic);
}

/* -------------------- QUIZ UI -------------------- */

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
        <div id="quizQuestionText" class="millionaire-question">Question appears here</div>
      </div>

      <div id="quizOptions" class="millionaire-options"></div>
      <div id="quizFeedback" class="millionaire-feedback"></div>
    </div>
  `;

  document.getElementById("app").appendChild(quizOverlay);
}

/* -------------------- ASSETS -------------------- */

const assets = {
  playerAnimations: {},
  fallbackPlayer: new Image()
};

const obstacleImages = {};
let fallbackPlayerLoaded = false;

let musicEnabled = localStorage.getItem("thalapathyRunMusic") !== "off";
let musicLoadFailed = false;

const audioPlaylist =
  Array.isArray(CONFIG.audio.playlist) && CONFIG.audio.playlist.length > 0
    ? CONFIG.audio.playlist
    : [{ name: "Theme", src: "assets/audio/theme.mp3" }];

let currentSongIndex = Number(localStorage.getItem("thalapathyRunSongIndex") || 0);

if (currentSongIndex < 0 || currentSongIndex >= audioPlaylist.length) {
  currentSongIndex = 0;
}

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
let tokens = 0;
let best = Number(localStorage.getItem("thalapathyRunBest") || 0);
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

let currentPhaseIndex = 0;
let lastShownPhaseId = null;
let phaseBannerTimer = 0;
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

function getCurrentPhase() {
  return CONFIG.phases[currentPhaseIndex] || CONFIG.phases[0] || DEFAULT_CONFIG.phases[0];
}

function getPhaseByX(x) {
  for (let i = 0; i < CONFIG.phases.length; i++) {
    const phase = CONFIG.phases[i];

    if (x >= phase.startX && x < phase.endX) {
      return { phase, index: i };
    }
  }

  return {
    phase: CONFIG.phases[CONFIG.phases.length - 1] || DEFAULT_CONFIG.phases[0],
    index: Math.max(0, CONFIG.phases.length - 1)
  };
}

/* -------------------- INTRO / OUTRO -------------------- */

function setupIntroVideo() {
  if (!introVideo || !introSoundBtn) return;

  introSoundBtn.addEventListener("click", async () => {
    try {
      introVideo.muted = false;
      introVideo.volume = 1.0;
      await introVideo.play();

      introSoundBtn.textContent = "🔊 Intro Sound Playing";
      introSoundBtn.classList.add("playing");
    } catch (error) {
      introSoundBtn.textContent = "Tap video to enable sound";
      console.warn("Intro video sound could not start:", error);
    }
  });

  introVideo.addEventListener("click", async () => {
    try {
      introVideo.muted = !introVideo.muted;

      if (!introVideo.muted) {
        introVideo.volume = 1.0;
        await introVideo.play();
        introSoundBtn.textContent = "🔊 Intro Sound Playing";
        introSoundBtn.classList.add("playing");
      } else {
        introSoundBtn.textContent = "🔊 Play Intro Sound";
        introSoundBtn.classList.remove("playing");
      }
    } catch (error) {
      console.warn("Video click sound toggle failed:", error);
    }
  });
}

function stopIntroVideo() {
  if (!introVideo) return;

  introVideo.pause();
  introVideo.muted = true;
}

function setupOutroMedia(finished) {
  if (!outroMediaBox || !outroVideo || !outroImage) return;

  if (!finished) {
    outroMediaBox.classList.add("hidden");
    outroVideo.pause();
    outroVideo.currentTime = 0;
    outroImage.style.display = "none";
    outroVideo.style.display = "block";
    return;
  }

  outroMediaBox.classList.remove("hidden");
  outroImage.style.display = "none";
  outroVideo.style.display = "block";

  outroVideo.loop = false;
  outroVideo.currentTime = 0;

  outroVideo.onended = () => {
    outroVideo.style.display = "none";
    outroImage.style.display = "block";
  };

  const playPromise = outroVideo.play();

  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      outroVideo.style.display = "none";
      outroImage.style.display = "block";
    });
  }
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
  for (const phase of CONFIG.phases) {
    for (const obstacle of phase.obstacles) {
      if (!obstacle.image || obstacleImages[obstacle.image]) continue;

      const img = new Image();

      img.onload = () => render();

      img.onerror = () => {
        console.warn("Missing obstacle image:", obstacle.image);
      };

      img.src = obstacle.image;
      obstacleImages[obstacle.image] = img;
    }
  }
}

/* -------------------- AUDIO -------------------- */

function getCurrentSong() {
  return audioPlaylist[currentSongIndex];
}

function updateSongName() {
  if (!songNameText) return;

  const song = getCurrentSong();
  songNameText.textContent = `Song: ${song.name}`;
}

function loadCurrentSong() {
  const song = getCurrentSong();

  musicLoadFailed = false;

  bgMusic.src = song.src;
  bgMusic.loop = CONFIG.audio.loop;
  bgMusic.volume = CONFIG.audio.volume;
  bgMusic.preload = "auto";

  updateSongName();
  updateMusicButton();
}

function setupAudio() {
  if (!CONFIG.audio.enabled) {
    musicEnabled = false;
  }

  bgMusic.addEventListener("error", () => {
    musicLoadFailed = true;
    updateMusicButton();
    showMessage(`Song not found: ${getCurrentSong().src}`);
  });

  bgMusic.addEventListener("canplaythrough", () => {
    musicLoadFailed = false;
    updateMusicButton();
  });

  loadCurrentSong();
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
    playPromise.catch(() => {
      updateMusicButton("Tap to Play");
    });
  }

  updateMusicButton();
}

function pauseMusic() {
  bgMusic.pause();
  updateMusicButton();
}

function toggleMusic() {
  if (!CONFIG.audio.enabled || musicLoadFailed) {
    showMessage("No music loaded. Check your assets/audio folder.");
    return;
  }

  musicEnabled = !musicEnabled;
  localStorage.setItem("thalapathyRunMusic", musicEnabled ? "on" : "off");

  if (musicEnabled) {
    startMusic();
  } else {
    pauseMusic();
  }

  updateMusicButton();
}

function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % audioPlaylist.length;
  localStorage.setItem("thalapathyRunSongIndex", String(currentSongIndex));

  const shouldPlay = musicEnabled && state !== "start" && state !== "over";

  loadCurrentSong();

  if (shouldPlay) {
    startMusic();
  }

  showMessage(`Now playing: ${getCurrentSong().name}`);
}

function setPhaseMusic(phase) {
  if (typeof phase.musicIndex !== "number") return;
  if (phase.musicIndex < 0 || phase.musicIndex >= audioPlaylist.length) return;
  if (currentSongIndex === phase.musicIndex) return;

  currentSongIndex = phase.musicIndex;
  localStorage.setItem("thalapathyRunSongIndex", String(currentSongIndex));

  const shouldPlay = musicEnabled && state === "running";

  loadCurrentSong();

  if (shouldPlay) {
    startMusic();
  }
}

function updateMusicButton(customText) {
  if (!musicBtn) return;

  if (!CONFIG.audio.enabled) {
    musicBtn.textContent = "🔇 Music Off";
    musicBtn.classList.add("off");
    return;
  }

  if (musicLoadFailed) {
    musicBtn.textContent = "⚠️ Missing Song";
    musicBtn.classList.add("off");
    updateSongName();
    return;
  }

  if (customText) {
    musicBtn.textContent = `🔊 ${customText}`;
    musicBtn.classList.remove("off");
    updateSongName();
    return;
  }

  if (musicEnabled) {
    musicBtn.textContent = bgMusic.paused ? "🔊 Unmuted" : "🔊 Playing";
    musicBtn.classList.remove("off");
  } else {
    musicBtn.textContent = "🔇 Muted";
    musicBtn.classList.add("off");
  }

  updateSongName();
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
  tokens = 0;
  farthestX = CONFIG.level.startX;
  levelFinished = false;

  quizActive = false;
  activeQuizObstacle = null;
  quizOverlay.classList.remove("visible");

  cameraX = 0;
  currentPhaseIndex = 0;
  lastShownPhaseId = null;
  phaseBannerTimer = 0;

  obstacles = buildPhaseObstacles();
  collectibles = buildCollectibles();
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

  clouds = Array.from({ length: 11 }, () => ({
    x: Math.random() * CONFIG.level.worldWidth,
    y: 70 + Math.random() * height * 0.25,
    scale: 0.65 + Math.random() * 0.95,
    alpha: 0.16 + Math.random() * 0.18
  }));

  showPhaseBanner(getCurrentPhase());
  updateHud();
}

function buildPhaseObstacles() {
  const result = [];

  for (const phase of CONFIG.phases) {
    const count = phase.obstacleCount || phase.obstacles.length;
    const startX = phase.startX + 700;
    const endX = phase.endX - 350;
    const spacing = (endX - startX) / Math.max(1, count - 1);

    for (let i = 0; i < count; i++) {
      const template = phase.obstacles[Math.floor(Math.random() * phase.obstacles.length)];
      const x = startX + i * spacing;

      const baseY = template.type === "air"
        ? groundY - player.normalHeight - 88
        : groundY - template.height;

      result.push({
        ...template,
        phaseId: phase.id,
        phaseName: phase.name,
        x,
        baseY,
        y: baseY,
        seed: Math.random() * Math.PI * 2,
        disabled: false,
        cleared: false,
        dynamicScale: 1,
        rotation: 0
      });
    }
  }

  return result;
}

function buildCollectibles() {
  const result = [];

  for (const phase of CONFIG.phases) {
    const count = Math.floor(CONFIG.level.voteCount / CONFIG.phases.length);
    const startX = phase.startX + 450;
    const endX = phase.endX - 450;

    for (let i = 0; i < count; i++) {
      const x = startX + Math.random() * (endX - startX);
      const y = Math.random() > 0.5
        ? groundY - 190 - Math.random() * 90
        : groundY - 120 - Math.random() * 50;

      result.push({
        x,
        y,
        phaseId: phase.id,
        size: CONFIG.collectible.size,
        collected: false,
        spin: Math.random() * Math.PI * 2
      });
    }
  }

  return result;
}

/* -------------------- START / PAUSE / END -------------------- */

function startGame() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  stopIntroVideo();
  resetGame();

  state = "running";

  startScreen.classList.remove("visible");
  pauseScreen.classList.remove("visible");
  gameOverScreen.classList.remove("visible");

  startMusic();

  lastTime = performance.now();
  animationFrameId = requestAnimationFrame(loop);
}

function startGame() {
  console.log("Start Game clicked");

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  stopIntroVideo();
  resetGame();

  state = "running";

  if (startScreen) startScreen.classList.remove("visible");
  if (pauseScreen) pauseScreen.classList.remove("visible");
  if (gameOverScreen) gameOverScreen.classList.remove("visible");

  startMusic();

  lastTime = performance.now();
  animationFrameId = requestAnimationFrame(loop);
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
    localStorage.setItem("thalapathyRunBest", String(best));
  }

  updateHud();

  if (gameOverBadge) {
    gameOverBadge.textContent = finished ? "Congratulations" : "Game Over";
    gameOverBadge.classList.toggle("danger", !finished);
  }

  if (gameOverTitle) {
    gameOverTitle.textContent = finished ? "Congratulations!" : "Run Complete";
  }

  if (finalText) {
    finalText.innerHTML = `
      <strong>${finished ? "You completed Thalapathy Run!" : "Game Over"}</strong><br>
      <strong>Score:</strong> ${score}<br>
      <strong>Tokens:</strong> ${tokens}<br>
      <strong>Distance:</strong> ${Math.floor(farthestX)}<br>
      <strong>Best:</strong> ${best}
    `;
  }

  setupOutroMedia(finished);
  gameOverScreen.classList.add("visible");
}

function updateHud() {
  scoreText.textContent = Math.floor(score);
  votesText.textContent = tokens;
  bestText.textContent = best;

  const phase = getCurrentPhase();

  if (phaseHudText && phase) {
    phaseHudText.textContent = `Phase ${phase.id} • ${phase.name}`;
  }
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

  updatePhase();
  updatePhaseBanner(dt);
  updateObstacles();
  updatePlayer(dt);
  updatePlayerAnimation(dt);
  updateCollectibles(dt);
  updateParticles(dt);
  updateCamera();

  farthestX = Math.max(farthestX, player.x);
  score = Math.floor(farthestX * CONFIG.scoring.distanceMultiplier) + tokens * CONFIG.scoring.voteValue;

  if (player.x >= CONFIG.level.finishX) {
    finishLevel();
  }

  updateHud();
  updateMusicButton();
}

function updatePhase() {
  const result = getPhaseByX(player.x);

  if (result.index !== currentPhaseIndex) {
    currentPhaseIndex = result.index;
    showPhaseBanner(result.phase);
    setPhaseMusic(result.phase);
  }
}

function showPhaseBanner(phase) {
  if (!phase || phase.id === lastShownPhaseId) return;

  lastShownPhaseId = phase.id;
  phaseBannerTimer = 2.2;

  if (phaseBannerLabel) phaseBannerLabel.textContent = `Phase ${phase.id}`;
  if (phaseBannerTitle) phaseBannerTitle.textContent = phase.name;
  if (phaseBannerSubtitle) phaseBannerSubtitle.textContent = phase.subtitle;

  if (phaseBanner) phaseBanner.classList.add("visible");
}

function updatePhaseBanner(dt) {
  if (phaseBannerTimer <= 0) return;

  phaseBannerTimer -= dt;

  if (phaseBannerTimer <= 0 && phaseBanner) {
    phaseBanner.classList.remove("visible");
  }
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

  if (keys.down && player.grounded) {
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

/* -------------------- OBSTACLES -------------------- */

function updateObstacles() {
  for (const obstacle of obstacles) {
    obstacle.y = getObstacleY(obstacle);
    obstacle.dynamicScale = getObstacleScale(obstacle);
    obstacle.rotation = getObstacleRotation(obstacle);
  }
}

function getObstacleY(obstacle) {
  const t = elapsed + obstacle.seed;

  if (obstacle.behavior === "float") {
    return obstacle.baseY + Math.sin(t * 2.2) * 28;
  }

  if (obstacle.behavior === "wave") {
    return obstacle.baseY + Math.sin(t * 3.0) * 22;
  }

  if (obstacle.behavior === "bounce") {
    return obstacle.baseY - Math.abs(Math.sin(t * 4.0)) * 12;
  }

  if (obstacle.behavior === "drop") {
    return obstacle.baseY + Math.max(0, Math.sin(t * 2.5)) * 52;
  }

  return obstacle.baseY;
}

function getObstacleScale(obstacle) {
  const t = elapsed + obstacle.seed;

  if (obstacle.behavior === "pulse") {
    return 1 + Math.sin(t * 4.5) * 0.06;
  }

  if (obstacle.behavior === "stretch") {
    return 1 + Math.sin(t * 3.0) * 0.08;
  }

  if (obstacle.behavior === "flash") {
    return 1 + Math.max(0, Math.sin(t * 8.0)) * 0.04;
  }

  return 1;
}

function getObstacleRotation(obstacle) {
  const t = elapsed + obstacle.seed;

  if (obstacle.behavior === "roll") {
    return t * 2.5;
  }

  return 0;
}

/* -------------------- QUIZ SYSTEM -------------------- */

function forceQuizForTesting() {
  if (state === "start") startGame();
  triggerQuiz(null);
}

function triggerQuiz(obstacle) {
  if (quizActive) return;

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

  showQuizQuestion(obstacle);
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

function showQuizQuestion(obstacle) {
  const question = getRandomQuizQuestion();

  const questionText = document.getElementById("quizQuestionText");
  const optionsBox = document.getElementById("quizOptions");
  const feedback = document.getElementById("quizFeedback");

  const obstacleText = obstacle ? `Obstacle: ${obstacle.name}. ` : "";

  questionText.textContent = obstacleText + question.question;
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
  animationFrameId = requestAnimationFrame(loop);
}

/* -------------------- COLLECTIBLES / PARTICLES -------------------- */

function updateCollectibles(dt) {
  for (const item of collectibles) {
    item.spin += dt * 8;

    if (!item.collected && circleRectOverlap(item, getPlayerHitbox())) {
      item.collected = true;
      tokens += 1;

      spawnBurst(item.x, item.y, CONFIG.colors.gold, 20);

      const phase = CONFIG.phases.find(p => p.id === item.phaseId);

      floatingTexts.push({
        text: `+1 ${phase?.tokenName || "Token"}`,
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

function isSliding() {
  return keys.down && player.grounded;
}

function getPlayerHitbox() {
  if (isSliding()) {
    const slideHeight = CONFIG.player.slideHeight;

    return {
      x: player.x + CONFIG.player.hitboxPaddingX,
      y: player.y + player.normalHeight - slideHeight,
      width: player.width - CONFIG.player.hitboxPaddingX * 2,
      height: slideHeight - 18
    };
  }

  return {
    x: player.x + CONFIG.player.hitboxPaddingX,
    y: player.y + CONFIG.player.hitboxPaddingTop,
    width: player.width - CONFIG.player.hitboxPaddingX * 2,
    height: player.height - CONFIG.player.hitboxPaddingTop - CONFIG.player.hitboxPaddingBottom
  };
}

function getObstacleHitbox(obstacle) {
  const scale = obstacle.dynamicScale || 1;
  const obstacleWidth = obstacle.width * scale;
  const obstacleHeight = obstacle.height * scale;

  const padX = obstacleWidth * 0.34;
  const padTop = obstacleHeight * 0.30;
  const padBottom = obstacleHeight * 0.32;

  return {
    x: obstacle.x + (obstacle.width - obstacleWidth) / 2 + padX,
    y: obstacle.y + (obstacle.height - obstacleHeight) / 2 + padTop,
    width: obstacleWidth - padX * 2,
    height: obstacleHeight - padTop - padBottom
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
  drawPhaseMarkers();
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
  const phase = getCurrentPhase();
  const gradient = ctx.createLinearGradient(0, 0, 0, height);

  if (phase.theme === "cinema") {
    gradient.addColorStop(0, "#160c2e");
    gradient.addColorStop(0.38, "#3b1768");
    gradient.addColorStop(0.7, "#9a3b5f");
    gradient.addColorStop(1, "#f7b267");
  } else if (phase.theme === "campaign") {
    gradient.addColorStop(0, "#0c1338");
    gradient.addColorStop(0.42, "#1d3c62");
    gradient.addColorStop(0.72, "#bf563f");
    gradient.addColorStop(1, "#ffd166");
  } else {
    gradient.addColorStop(0, "#143d59");
    gradient.addColorStop(0.42, "#2e6f95");
    gradient.addColorStop(0.72, "#7bbf7a");
    gradient.addColorStop(1, "#ffe08a");
  }

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

  for (let i = 0; i < 75; i++) {
    const x = (i * 137 + 45 - cameraX * 0.08) % width;
    const y = (i * 71 + 28) % Math.max(190, height * 0.42);

    ctx.fillRect(x, y, 1.6, 1.6);
  }

  ctx.restore();
}

function drawParallax() {
  const phase = getCurrentPhase();

  drawClouds();

  if (phase.theme === "cinema") {
    drawCinemaBackground();
  } else if (phase.theme === "campaign") {
    drawCampaignBackground();
  } else {
    drawGovernmentBackground();
  }
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

function drawCinemaBackground() {
  const offset = -(cameraX * 0.35) % 420;

  ctx.save();
  ctx.globalAlpha = 0.32;

  for (let x = offset - 420; x < width + 420; x += 420) {
    ctx.fillStyle = "#221033";
    ctx.fillRect(x + 60, groundY - 230, 160, 210);

    ctx.fillStyle = "#ffd76a";
    ctx.fillRect(x + 82, groundY - 210, 116, 72);

    ctx.fillStyle = "#4f1b75";
    ctx.fillRect(x + 92, groundY - 200, 96, 52);

    ctx.fillStyle = "#111";
    ctx.font = "900 17px Arial";
    ctx.textAlign = "center";
    ctx.fillText("CINEMA", x + 140, groundY - 168);

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(x + 300, groundY - 250);
    ctx.lineTo(x + 355, groundY - 20);
    ctx.lineTo(x + 245, groundY - 20);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawCampaignBackground() {
  const offset = -(cameraX * 0.38) % 360;

  ctx.save();
  ctx.globalAlpha = 0.38;

  for (let x = offset - 360; x < width + 360; x += 360) {
    ctx.fillStyle = "#102822";
    ctx.fillRect(x + 80, groundY - 210, 170, 180);

    ctx.fillStyle = "#ffd76a";
    ctx.fillRect(x + 95, groundY - 190, 140, 34);

    ctx.fillStyle = "#fff";
    ctx.font = "900 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("CAMPAIGN", x + 165, groundY - 168);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x + 300, groundY - 220);
    ctx.lineTo(x + 300, groundY - 40);
    ctx.stroke();

    ctx.fillStyle = "#ff4d6d";
    ctx.beginPath();
    ctx.moveTo(x + 300, groundY - 220);
    ctx.lineTo(x + 380, groundY - 190);
    ctx.lineTo(x + 300, groundY - 160);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawGovernmentBackground() {
  const offset = -(cameraX * 0.28) % 520;

  ctx.save();
  ctx.globalAlpha = 0.38;

  for (let x = offset - 520; x < width + 520; x += 520) {
    ctx.fillStyle = "#f4f1de";
    ctx.fillRect(x + 110, groundY - 230, 250, 210);

    ctx.fillStyle = "#d9c5a0";
    ctx.fillRect(x + 100, groundY - 245, 270, 20);

    ctx.fillStyle = "#1c2f3f";
    ctx.font = "900 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText("SECRETARIAT", x + 235, groundY - 190);

    ctx.fillStyle = "#1c2f3f";
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(x + 130 + i * 42, groundY - 155, 24, 85);
    }
  }

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

function drawPhaseMarkers() {
  for (const phase of CONFIG.phases) {
    if (phase.startX === 0) continue;

    const x = phase.startX - cameraX;

    if (x < -120 || x > width + 120) continue;

    ctx.save();

    ctx.fillStyle = "#ffd76a";
    ctx.fillRect(x, groundY - 210, 8, 210);

    ctx.fillStyle = "rgba(7, 12, 32, 0.88)";
    ctx.strokeStyle = "#ffd76a";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.roundRect(x - 75, groundY - 250, 160, 58, 15);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "900 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`PHASE ${phase.id}`, x + 5, groundY - 228);

    ctx.fillStyle = "#ffd76a";
    ctx.font = "900 13px Arial";
    ctx.fillText(phase.shortName, x + 5, groundY - 208);

    ctx.restore();
  }
}

function drawFinishLine() {
  const x = CONFIG.level.finishX - cameraX;

  if (x < -120 || x > width + 120) return;

  ctx.save();

  ctx.fillStyle = "#ffd76a";
  ctx.fillRect(x, groundY - 240, 12, 240);

  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.roundRect(x + 10, groundY - 240, 150, 70, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#111";
  ctx.font = "900 18px Arial";
  ctx.textAlign = "center";
  ctx.fillText("CM CHAIR", x + 84, groundY - 210);
  ctx.fillText("FINISH", x + 84, groundY - 187);

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

  ctx.fillStyle = "#050505";
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.roundRect(x + 25, y + 48, 58, 68, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#c88755";
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

    if (screenX < -260 || screenX > width + 260) continue;

    const scale = obstacle.dynamicScale || 1;
    const drawWidth = obstacle.width * scale;
    const drawHeight = obstacle.height * scale;
    const drawX = screenX + (obstacle.width - drawWidth) / 2;
    const drawY = obstacle.y + (obstacle.height - drawHeight) / 2;

    const img = obstacle.image ? obstacleImages[obstacle.image] : null;

    ctx.save();

    ctx.translate(drawX + drawWidth / 2, drawY + drawHeight / 2);
    ctx.rotate((obstacle.rotation || 0) * 0.06);
    ctx.translate(-drawWidth / 2, -drawHeight / 2);

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;
      ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
      ctx.restore();
      continue;
    }

    drawFallbackObstacle(obstacle, drawWidth, drawHeight);

    ctx.restore();
  }
}

function drawFallbackObstacle(obstacle, drawWidth, drawHeight) {
  const phase = CONFIG.phases.find(p => p.id === obstacle.phaseId);

  let color = "#e84d5b";

  if (phase?.theme === "cinema") color = "#b84cff";
  if (phase?.theme === "campaign") color = "#ff6b35";
  if (phase?.theme === "government") color = "#2a9d8f";

  ctx.fillStyle = color;
  ctx.strokeStyle = "rgba(255,255,255,0.88)";
  ctx.lineWidth = 3;
  ctx.shadowColor = color;
  ctx.shadowBlur = obstacle.behavior === "flash" ? 30 : 18;

  ctx.beginPath();
  ctx.roundRect(0, 0, drawWidth, drawHeight, 20);
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fillRect(10, 10, drawWidth - 20, 12);

  ctx.fillStyle = "#111";
  ctx.font = "900 16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(obstacle.label || "OBS", drawWidth / 2, drawHeight / 2);
}

function drawCollectibles() {
  for (const item of collectibles) {
    if (item.collected) continue;

    const screenX = item.x - cameraX;

    if (screenX < -100 || screenX > width + 100) continue;

    const phase = CONFIG.phases.find(p => p.id === item.phaseId);
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
    ctx.font = "900 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const text = phase?.id === 1 ? "FAN" : phase?.id === 2 ? "LET" : "WEL";
    ctx.fillText(text, 0, 1);

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
  if (!button) {
    console.warn("Missing button for action:", action?.name || "anonymous");
    return;
  }

  let lastRun = 0;

  const runAction = event => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const now = performance.now();

    // Prevent double-trigger when pointerdown and click both fire.
    if (now - lastRun < 140) return;

    lastRun = now;
    action();
  };

  // Some browsers/devices behave better with click, some with pointerdown.
  // Use both so the Start Game button always responds.
  button.addEventListener("pointerdown", runAction);
  button.addEventListener("click", runAction);
  button.addEventListener("touchstart", runAction, { passive: false });
}

function toggleSettingsPanel() {
  if (!settingsPanel) return;
  settingsPanel.classList.toggle("visible");
}

function closeSettingsPanel() {
  if (!settingsPanel) return;
  settingsPanel.classList.remove("visible");
}

function initGame() {
  document.title = CONFIG.title;

  const brandTitle = document.querySelector(".brand h1");
  if (brandTitle) brandTitle.textContent = CONFIG.title;

  const startTitle = document.querySelector("#startScreen h2");
  if (startTitle) startTitle.textContent = CONFIG.title;

  setupIntroVideo();
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
  fastTap(settingsBtn, toggleSettingsPanel);
  fastTap(nextSongBtn, nextSong);

  document.addEventListener("pointerdown", event => {
    if (!settingsPanel || !settingsBtn) return;

    const clickedInsidePanel = settingsPanel.contains(event.target);
    const clickedSettingsButton = settingsBtn.contains(event.target);

    if (!clickedInsidePanel && !clickedSettingsButton) {
      closeSettingsPanel();
    }
  });

  setButtonHeld(leftBtn, "left");
  setButtonHeld(rightBtn, "right");

  window.addEventListener("resize", () => {
    resizeCanvas();
    render();
  });

  document.addEventListener("keydown", event => {
    if (event.code === "KeyQ") {
      event.preventDefault();
      forceQuizForTesting();
      return;
    }

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

  console.log("Thalapathy Run ready. Press Q to test quiz popup.");
}

initGame();
