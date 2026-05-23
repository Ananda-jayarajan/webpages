console.log("The Villupuram Run Pro: game.js loaded");

const DEFAULT_CONFIG = {
  physics: { gravity: 2450, jumpVelocity: -890, slideDuration: 0.62 },
  difficulty: {
    startSpeed: 420,
    maxSpeed: 980,
    speedGainPerSecond: 7.5,
    obstacleBaseGap: 720,
    obstacleRandomGap: 520
  },
  player: {
    x: 118,
    image: "assets/characters/vijay.png",
    width: 120,
    height: 155,
    slideHeight: 78,
    hitboxPaddingX: 28,
    hitboxPaddingTop: 20,
    hitboxPaddingBottom: 12
  },
  audio: {
    src: "assets/audio/theme.mp3",
    enabled: true,
    volume: 0.45,
    loop: true,
    pauseWhenPaused: true,
    continueAfterGameOver: false
  },
  scoring: { distanceMultiplier: 0.055, voteValue: 10, obstacleClearValue: 15 },
  colors: {
    gold: "#ffd76a",
    darkGreen: "#102822",
    suit: "#050505",
    skin: "#c88755",
    scarf: "#f4d35e"
  },
  obstacles: [
    { name: "Barricade", type: "ground", width: 72, height: 78, color: "#e84d5b", label: "STOP" },
    { name: "Podium", type: "ground", width: 76, height: 86, color: "#7f5af0", label: "MIC" },
    { name: "Flag Pole", type: "ground", width: 50, height: 112, color: "#2cb67d", label: "FLAG" },
    { name: "Low Banner", type: "air", width: 116, height: 48, color: "#ff8906", label: "DUCK" },
    { name: "Flying Poster", type: "air", width: 96, height: 58, color: "#f25f4c", label: "SLIDE" }
  ],
  collectible: { size: 34 },
  debug: { showHitboxes: false }
};

const CONFIG = {
  ...DEFAULT_CONFIG,
  ...(window.GAME_CONFIG || {}),
  physics: { ...DEFAULT_CONFIG.physics, ...(window.GAME_CONFIG?.physics || {}) },
  difficulty: { ...DEFAULT_CONFIG.difficulty, ...(window.GAME_CONFIG?.difficulty || {}) },
  player: { ...DEFAULT_CONFIG.player, ...(window.GAME_CONFIG?.player || {}) },
  audio: { ...DEFAULT_CONFIG.audio, ...(window.GAME_CONFIG?.audio || {}) },
  scoring: { ...DEFAULT_CONFIG.scoring, ...(window.GAME_CONFIG?.scoring || {}) },
  colors: { ...DEFAULT_CONFIG.colors, ...(window.GAME_CONFIG?.colors || {}) },
  collectible: { ...DEFAULT_CONFIG.collectible, ...(window.GAME_CONFIG?.collectible || {}) },
  debug: { ...DEFAULT_CONFIG.debug, ...(window.GAME_CONFIG?.debug || {}) }
};

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("scoreText");
const votesText = document.getElementById("votesText");
const bestText = document.getElementById("bestText");
const finalText = document.getElementById("finalText");

const startScreen = document.getElementById("startScreen");
const pauseScreen = document.getElementById("pauseScreen");
const gameOverScreen = document.getElementById("gameOverScreen");


function fastButton(button, action) {
  button.addEventListener("pointerdown", event => {
    event.preventDefault();
    action();
  });
}

fastButton(startBtn, startGame);
fastButton(restartBtn, restartGame);
fastButton(resumeBtn, togglePause);
fastButton(jumpBtn, jump);
fastButton(slideBtn, slide);
fastButton(musicBtn, toggleMusic);
const errorBanner = document.getElementById("errorBanner");

let bgMusic = document.getElementById("bgMusic");

if (!bgMusic) {
  bgMusic = document.createElement("audio");
  bgMusic.id = "bgMusic";
  bgMusic.loop = true;
  document.body.appendChild(bgMusic);
}

function showMessage(message) {
  if (!errorBanner) return;
  errorBanner.textContent = message;
  errorBanner.classList.add("visible");
  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => {
    errorBanner.classList.remove("visible");
  }, 5000);
}

const assets = {
  player: new Image()
};

const obstacleImages = {};

let playerImageLoaded = false;
let playerImageFailed = false;
let musicEnabled = localStorage.getItem("villupuramRunMusic") !== "off";
let musicLoadFailed = false;

let width = 0;
let height = 0;
let dpr = 1;
let groundY = 0;

let state = "start";
let lastTime = 0;
let elapsed = 0;
let speed = CONFIG.difficulty.startSpeed;
let score = 0;
let votes = 0;
let best = Number(localStorage.getItem("villupuramRunBest") || 0);
let distance = 0;
let shake = 0;

let obstacles = [];
let collectibles = [];
let particles = [];
let floatingTexts = [];
let clouds = [];
let nextObstacleIn = 0;
let nextVoteIn = 0;
let animationFrameId = null;

const player = {
  x: CONFIG.player.x,
  y: 0,
  width: CONFIG.player.width,
  height: CONFIG.player.height,
  normalWidth: CONFIG.player.width,
  normalHeight: CONFIG.player.height,
  slideHeight: CONFIG.player.slideHeight,
  vy: 0,
  grounded: true,
  sliding: false,
  slideTimer: 0,
  runFrame: 0
};

function loadAssets() {
  assets.player.onload = () => {
    playerImageLoaded = true;
    playerImageFailed = false;
    render();
  };

  assets.player.onerror = () => {
    playerImageLoaded = false;
    playerImageFailed = true;
    showMessage("vijay.png not found. Put it in assets/characters/vijay.png");
    render();
  };

  assets.player.src = CONFIG.player.image;
}

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
    playPromise.catch(() => {
      updateMusicButton("Tap Music");
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
}

function resetGame() {
  elapsed = 0;
  speed = CONFIG.difficulty.startSpeed;
  score = 0;
  votes = 0;
  distance = 0;
  shake = 0;

  obstacles = [];
  collectibles = [];
  particles = [];
  floatingTexts = [];

  player.width = player.normalWidth;
  player.height = player.normalHeight;
  player.y = groundY - player.normalHeight;
  player.vy = 0;
  player.grounded = true;
  player.sliding = false;
  player.slideTimer = 0;
  player.runFrame = 0;

  nextObstacleIn = 1.05;
  nextVoteIn = 1.6;

  clouds = Array.from({ length: 7 }, () => ({
    x: Math.random() * width,
    y: 75 + Math.random() * height * 0.23,
    scale: 0.65 + Math.random() * 0.95,
    speed: 10 + Math.random() * 22,
    alpha: 0.16 + Math.random() * 0.18
  }));

  updateHud();
}

function startGame() {
  console.log("Start Game clicked");

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

window.startGame = startGame;

function restartGame() {
  startGame();
}

function togglePause() {
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

function endGame() {
  state = "over";
  shake = 18;

  if (!CONFIG.audio.continueAfterGameOver) {
    pauseMusic();
  }

  if (score > best) {
    best = score;
    localStorage.setItem("villupuramRunBest", String(best));
  }

  updateHud();

  finalText.innerHTML = `
    <strong>Score:</strong> ${score}<br>
    <strong>Votes:</strong> ${votes}<br>
    <strong>Distance:</strong> ${Math.floor(distance)} m<br>
    <strong>Best:</strong> ${best}
  `;

  gameOverScreen.classList.add("visible");
}

function updateHud() {
  scoreText.textContent = Math.floor(score);
  votesText.textContent = votes;
  bestText.textContent = best;
}

function loop(now) {
  if (state !== "running") return;

  const dt = Math.min(0.033, (now - lastTime) / 1000 || 0);
  lastTime = now;

  update(dt);
  render();

  animationFrameId = requestAnimationFrame(loop);
}

function update(dt) {
  elapsed += dt;
  distance += speed * dt * 0.02;

  speed = Math.min(
    CONFIG.difficulty.maxSpeed,
    CONFIG.difficulty.startSpeed + elapsed * CONFIG.difficulty.speedGainPerSecond
  );

  score = Math.floor(distance * CONFIG.scoring.distanceMultiplier * 100) + votes * CONFIG.scoring.voteValue;

  updatePlayer(dt);
  updateSpawns(dt);
  updateObstacles(dt);
  updateCollectibles(dt);
  updateParticles(dt);
  updateClouds(dt);

  if (shake > 0) {
    shake = Math.max(0, shake - 50 * dt);
  }

  updateHud();
  updateMusicButton();
}

function updatePlayer(dt) {
  player.runFrame += dt * (9 + speed / 100);

  if (player.sliding) {
    player.slideTimer -= dt;
    player.height = player.slideHeight;
    player.y = groundY - player.height;

    if (player.slideTimer <= 0) {
      player.sliding = false;
      player.height = player.normalHeight;
      player.y = groundY - player.height;
    }
  }

  if (!player.grounded) {
    player.vy += CONFIG.physics.gravity * dt;
    player.y += player.vy * dt;

    if (player.y + player.height >= groundY) {
      player.y = groundY - player.height;
      player.vy = 0;
      player.grounded = true;
      spawnDust(player.x + player.width / 2, groundY, 12);
    }
  }
}

function updateSpawns(dt) {
  nextObstacleIn -= dt;
  nextVoteIn -= dt;

  if (nextObstacleIn <= 0) {
    spawnObstacle();
    const gapPixels = CONFIG.difficulty.obstacleBaseGap + Math.random() * CONFIG.difficulty.obstacleRandomGap;
    nextObstacleIn = gapPixels / speed;
  }

  if (nextVoteIn <= 0) {
    spawnVote();
    nextVoteIn = 1.05 + Math.random() * 1.8;
  }
}

function spawnObstacle() {
  const template = CONFIG.obstacles[Math.floor(Math.random() * CONFIG.obstacles.length)];
  const isAir = template.type === "air";
  const y = isAir ? groundY - player.normalHeight + 20 : groundY - template.height;

  obstacles.push({
    ...template,
    x: width + 80,
    y,
    cleared: false,
    pulse: Math.random() * Math.PI * 2
  });
}

function spawnVote() {
  const high = Math.random() > 0.45;
  const y = high ? groundY - 175 - Math.random() * 80 : groundY - 120 - Math.random() * 50;

  collectibles.push({
    x: width + 80,
    y,
    size: CONFIG.collectible.size,
    collected: false,
    spin: Math.random() * Math.PI * 2
  });
}

function updateObstacles(dt) {
  for (const obstacle of obstacles) {
    obstacle.x -= speed * dt;

    if (!obstacle.cleared && obstacle.x + obstacle.width < player.x) {
      obstacle.cleared = true;
      score += CONFIG.scoring.obstacleClearValue;
      floatingTexts.push({
        text: "+15",
        x: player.x + 18,
        y: player.y - 22,
        vy: -42,
        life: 0.75
      });
    }

    if (rectsOverlap(getPlayerHitbox(), getObstacleHitbox(obstacle))) {
      spawnBurst(player.x + player.width / 2, player.y + player.height / 2, "#ff4d6d", 24);
      endGame();
      return;
    }
  }

  obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > -160);
}

function updateCollectibles(dt) {
  for (const item of collectibles) {
    item.x -= speed * dt;
    item.spin += dt * 8;

    if (!item.collected && circleRectOverlap(item, getPlayerHitbox())) {
      item.collected = true;
      votes += 1;
      score += CONFIG.scoring.voteValue;
      spawnBurst(item.x, item.y, CONFIG.colors.gold, 20);
      floatingTexts.push({
        text: "+1 Vote",
        x: item.x - 10,
        y: item.y - 18,
        vy: -50,
        life: 0.85
      });
    }
  }

  collectibles = collectibles.filter(item => !item.collected && item.x > -80);
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

function updateClouds(dt) {
  for (const cloud of clouds) {
    cloud.x -= cloud.speed * dt;
    if (cloud.x < -180) {
      cloud.x = width + 120;
      cloud.y = 70 + Math.random() * height * 0.25;
      cloud.scale = 0.65 + Math.random() * 0.95;
    }
  }
}

function jump() {
  if (state === "start") {
    startGame();
    return;
  }

  if (state !== "running") return;
  if (!player.grounded || player.sliding) return;

  player.vy = CONFIG.physics.jumpVelocity;
  player.grounded = false;
  spawnDust(player.x + 12, groundY, 8);
}

function slide() {
  if (state !== "running") return;
  if (!player.grounded || player.sliding) return;

  player.sliding = true;
  player.slideTimer = CONFIG.physics.slideDuration;
  player.height = player.slideHeight;
  player.y = groundY - player.height;
  spawnDust(player.x + 12, groundY, 10);
}

function getPlayerHitbox() {
  return {
    x: player.x + CONFIG.player.hitboxPaddingX,
    y: player.y + CONFIG.player.hitboxPaddingTop,
    width: player.width - CONFIG.player.hitboxPaddingX * 2,
    height: player.height - CONFIG.player.hitboxPaddingTop - CONFIG.player.hitboxPaddingBottom
  };
}

function getObstacleHitbox(obstacle) {
  return {
    x: obstacle.x + 9,
    y: obstacle.y + 8,
    width: obstacle.width - 18,
    height: obstacle.height - 16
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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

function render() {
  ctx.save();

  if (shake > 0) {
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
  }

  drawSky();
  drawParallax();
  drawGround();
  drawCollectibles();
  drawObstacles();
  drawPlayer();
  drawParticles();
  drawSpeedLines();

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
    const x = (i * 137 + 45) % width;
    const y = (i * 71 + 28) % Math.max(190, height * 0.42);
    ctx.fillRect(x, y, 1.6, 1.6);
  }
  ctx.restore();
}

function drawParallax() {
  drawClouds();

  const mountainOffset = -(distance * 0.25) % width;
  drawMountains(mountainOffset, groundY - 250, "#211839", 0.72);
  drawMountains(mountainOffset + width, groundY - 250, "#211839", 0.72);

  const hillOffset = -(distance * 0.45) % width;
  drawHills(hillOffset, groundY - 120, "#18332e", 0.96);
  drawHills(hillOffset + width, groundY - 120, "#18332e", 0.96);
}

function drawClouds() {
  for (const cloud of clouds) {
    ctx.save();
    ctx.globalAlpha = cloud.alpha;
    ctx.fillStyle = "#fff";
    ctx.translate(cloud.x, cloud.y);
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
  ctx.fillStyle = "#102822";
  ctx.fillRect(0, groundY, width, height - groundY);

  ctx.fillStyle = "#f7d794";
  ctx.fillRect(0, groundY, width, 6);

  const stripeOffset = -(distance * 5) % 56;

  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#f7d794";

  for (let x = stripeOffset - 80; x < width + 80; x += 56) {
    ctx.fillRect(x, groundY + 38, 28, 4);
  }

  ctx.restore();
}

function drawPlayer() {
  drawCharacterShadow(player.x, groundY);

  if (playerImageLoaded) {
    drawPlayerImage();
  } else {
    drawFallbackPlayer();
  }
}

function drawPlayerImage() {
  /*
    Stable image mode:
    - No running bobbing.
    - No automatic rotation.
    - No frame-to-frame shake.
    The image only moves when the player jumps or slides.
  */

  ctx.save();

  const drawX = player.x;
  const drawY = player.sliding
    ? groundY - player.normalHeight + 18
    : player.y;

  const drawWidth = player.normalWidth;
  const drawHeight = player.normalHeight;

  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 6;

  ctx.drawImage(assets.player, drawX, drawY, drawWidth, drawHeight);

  ctx.restore();
}
function drawCharacterShadow(x, y) {
  ctx.save();
  ctx.globalAlpha = 0.24;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(x + player.normalWidth / 2, y + 8, player.sliding ? 58 : 46, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFallbackPlayer() {
  const x = player.x;
  const y = player.y;
  const bob = player.grounded && !player.sliding ? Math.sin(player.runFrame * Math.PI * 2) * 2 : 0;

  ctx.save();

  ctx.fillStyle = CONFIG.colors.suit;
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.roundRect(x + 25, y + 48 + bob, 58, 68, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = CONFIG.colors.skin;
  ctx.beginPath();
  ctx.roundRect(x + 32, y + 5 + bob, 46, 48, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.roundRect(x + 22, y + bob, 66, 25, 14);
  ctx.fill();

  ctx.fillStyle = "#f4d35e";
  ctx.beginPath();
  ctx.roundRect(x + 21, y + 52 + bob, 70, 15, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#111";
  ctx.font = "900 10px Arial";
  ctx.fillText("TVK", x + 46, y + 64 + bob);

  ctx.restore();
}

function drawObstacles() {
  for (const obstacle of obstacles) {
    const pulse = Math.sin(elapsed * 6 + obstacle.pulse) * 0.08 + 1;

    ctx.save();
    ctx.translate(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
    ctx.scale(pulse, pulse);
    ctx.translate(-obstacle.width / 2, -obstacle.height / 2);

    ctx.fillStyle = obstacle.color;
    ctx.strokeStyle = "rgba(255,255,255,0.88)";
    ctx.lineWidth = 3;
    ctx.shadowColor = obstacle.color;
    ctx.shadowBlur = 18;

    ctx.beginPath();
    ctx.roundRect(0, 0, obstacle.width, obstacle.height, 18);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.roundRect(10, 10, obstacle.width - 20, obstacle.height - 20, 10);
    ctx.fill();

    ctx.fillStyle = "#111";
    ctx.font = "900 13px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(obstacle.label, obstacle.width / 2, obstacle.height / 2);

    ctx.restore();
  }
}

function drawCollectibles() {
  for (const item of collectibles) {
    const radius = item.size / 2;
    const squash = 0.72 + Math.abs(Math.sin(item.spin)) * 0.28;

    ctx.save();
    ctx.translate(item.x, item.y);
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
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
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
    ctx.strokeText(text.text, text.x, text.y);
    ctx.fillText(text.text, text.x, text.y);
    ctx.restore();
  }
}

function drawSpeedLines() {
  if (speed < 610) return;

  ctx.save();
  ctx.globalAlpha = clamp((speed - 600) / 650, 0, 0.26);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;

  for (let i = 0; i < 14; i++) {
    const y = 100 + ((i * 73 + elapsed * 320) % (height - 230));
    const x = (i * 157 + elapsed * 700) % width;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 44, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawHitboxes() {
  const playerBox = getPlayerHitbox();

  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "lime";
  ctx.strokeRect(playerBox.x, playerBox.y, playerBox.width, playerBox.height);

  ctx.strokeStyle = "red";
  for (const obstacle of obstacles) {
    const box = getObstacleHitbox(obstacle);
    ctx.strokeRect(box.x, box.y, box.width, box.height);
  }
  ctx.restore();
}

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

function initGame() {
  loadAssets();
  resizeCanvas();
  setupAudio();
  resetGame();
  render();

  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", restartGame);
  resumeBtn.addEventListener("click", togglePause);
  jumpBtn.addEventListener("click", jump);
  slideBtn.addEventListener("click", slide);
  musicBtn.addEventListener("click", toggleMusic);

  window.addEventListener("resize", () => {
    resizeCanvas();
    render();
  });

  document.addEventListener("keydown", event => {
    if (event.code === "Space" || event.code === "ArrowUp") {
      event.preventDefault();
      jump();
    }

    if (event.code === "ArrowDown") {
      event.preventDefault();
      slide();
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

  let touchStartY = 0;

  canvas.addEventListener("touchstart", event => {
    touchStartY = event.touches[0].clientY;
  }, { passive: true });

  canvas.addEventListener("touchend", event => {
    const diff = touchStartY - event.changedTouches[0].clientY;

    if (diff > 38) jump();
    if (diff < -38) slide();
  }, { passive: true });

  console.log("The Villupuram Run Pro: ready");
}

initGame();
