console.log("The Villupuram Run Platformer: game.js loaded");

const DEFAULT_CONFIG = {
  physics: { gravity: 2250, jumpVelocity: -1050, moveAcceleration: 4200, maxMoveSpeed: 520, groundFriction: 0.82, airControl: 0.72 },
  level: { worldWidth: 7200, startX: 140, finishX: 6900, obstacleCount: 26, voteCount: 34, minObstacleGap: 230 },
  player: { image: "assets/characters/vijay.png", width: 120, height: 155, hitboxPaddingX: 28, hitboxPaddingTop: 20, hitboxPaddingBottom: 12 },
  audio: { src: "assets/audio/theme.mp3", enabled: true, volume: 0.45, loop: true, pauseWhenPaused: true, continueAfterGameOver: false },
  scoring: { distanceMultiplier: 0.08, voteValue: 20, finishBonus: 500 },
  colors: { gold: "#ffd76a", darkGreen: "#102822", suit: "#050505", skin: "#c88755", scarf: "#f4d35e" },
  obstacles: Array.from({ length: 20 }, (_, i) => {
    const n = i + 1, isAir = n % 5 === 0;
    return { name: `Obstacle ${n}`, type: isAir ? "air" : "ground", width: isAir ? 170 : 118, height: isAir ? 82 : 118, color: "#e84d5b", label: String(n), image: `assets/obstacles/${n}.png` };
  }),
  collectible: { size: 36 },
  debug: { showHitboxes: false }
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
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const musicBtn = document.getElementById("musicBtn");

let bgMusic = document.getElementById("bgMusic") || document.createElement("audio");
bgMusic.id = "bgMusic";
bgMusic.loop = true;

const assets = { player: new Image() };
const obstacleImages = {};
const keys = { left: false, right: false };

let playerImageLoaded = false;
let musicEnabled = localStorage.getItem("villupuramRunMusic") !== "off";
let musicLoadFailed = false;

let width = 0, height = 0, dpr = 1, groundY = 0, cameraX = 0;
let state = "start", lastTime = 0, elapsed = 0, score = 0, votes = 0;
let best = Number(localStorage.getItem("villupuramRunBestPlatformer") || 0);
let farthestX = 0, levelFinished = false;
let obstacles = [], collectibles = [], particles = [], floatingTexts = [], clouds = [];
let animationFrameId = null;

const player = {
  x: CONFIG.level.startX, y: 0, vx: 0, vy: 0,
  width: CONFIG.player.width, height: CONFIG.player.height,
  grounded: true, facing: 1, runFrame: 0
};

function showMessage(message) {
  if (!errorBanner) return;
  errorBanner.textContent = message;
  errorBanner.classList.add("visible");
  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => errorBanner.classList.remove("visible"), 5000);
}

function loadAssets() {
  assets.player.onload = () => { playerImageLoaded = true; render(); };
  assets.player.onerror = () => { playerImageLoaded = false; showMessage("vijay.png not found. Put it in assets/characters/vijay.png"); render(); };
  assets.player.src = CONFIG.player.image;

  for (const obstacle of CONFIG.obstacles) {
    if (!obstacle.image || obstacleImages[obstacle.image]) continue;
    const img = new Image();
    img.onload = () => render();
    img.onerror = () => console.warn("Missing obstacle image:", obstacle.image);
    img.src = obstacle.image;
    obstacleImages[obstacle.image] = img;
  }
}

function setupAudio() {
  if (!CONFIG.audio.enabled) musicEnabled = false;
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
  musicEnabled ? startMusic() : pauseMusic();
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
  updateCamera();
}

function resetGame() {
  elapsed = 0; score = 0; votes = 0; farthestX = CONFIG.level.startX; levelFinished = false; cameraX = 0;
  obstacles = buildRandomObstacles();
  collectibles = buildRandomVotes();
  particles = []; floatingTexts = [];
  player.x = CONFIG.level.startX; player.y = groundY - player.height; player.vx = 0; player.vy = 0;
  player.grounded = true; player.facing = 1; player.runFrame = 0;
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
  let lastX = 520;
  for (let i = 0; i < CONFIG.level.obstacleCount; i++) {
    const template = CONFIG.obstacles[Math.floor(Math.random() * CONFIG.obstacles.length)];
    const gap = CONFIG.level.minObstacleGap + Math.random() * 260;
    const x = lastX + gap;
    lastX = x;
    if (x > CONFIG.level.finishX - 280) break;
    const y = template.type === "air" ? groundY - player.height + 18 : groundY - template.height;
    result.push({ ...template, x, y, cleared: false });
  }
  return result;
}

function buildRandomVotes() {
  const result = [];
  for (let i = 0; i < CONFIG.level.voteCount; i++) {
    const x = 450 + Math.random() * (CONFIG.level.finishX - 700);
    const y = Math.random() > 0.5 ? groundY - 190 - Math.random() * 90 : groundY - 120 - Math.random() * 50;
    result.push({ x, y, size: CONFIG.collectible.size, collected: false, spin: Math.random() * Math.PI * 2 });
  }
  return result;
}

function startGame() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  resetGame();
  state = "running";
  startScreen.classList.remove("visible");
  pauseScreen.classList.remove("visible");
  gameOverScreen.classList.remove("visible");
  startMusic();
  lastTime = performance.now();
  animationFrameId = requestAnimationFrame(loop);
}

function restartGame() { startGame(); }

function togglePause() {
  if (state === "running") {
    state = "paused";
    pauseScreen.classList.add("visible");
    if (CONFIG.audio.pauseWhenPaused) pauseMusic();
  } else if (state === "paused") {
    state = "running";
    pauseScreen.classList.remove("visible");
    if (CONFIG.audio.pauseWhenPaused) startMusic();
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(loop);
  }
}

function finishLevel() {
  if (levelFinished) return;
  levelFinished = true;
  score += CONFIG.scoring.finishBonus;
  floatingTexts.push({ text: "+500 Finish", x: player.x, y: player.y - 30, vy: -50, life: 1.2 });
  setTimeout(() => { if (state === "running") endGame(true); }, 700);
}

function endGame(finished = false) {
  state = "over";
  keys.left = false; keys.right = false;
  if (!CONFIG.audio.continueAfterGameOver) pauseMusic();
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
  updatePlayer(dt);
  updateCollectibles(dt);
  updateParticles(dt);
  updateCamera();
  farthestX = Math.max(farthestX, player.x);
  score = Math.floor(farthestX * CONFIG.scoring.distanceMultiplier) + votes * CONFIG.scoring.voteValue;
  if (player.x >= CONFIG.level.finishX) finishLevel();
  updateHud();
  updateMusicButton();
}

function updatePlayer(dt) {
  const movingLeft = keys.left && !keys.right;
  const movingRight = keys.right && !keys.left;
  const control = player.grounded ? 1 : CONFIG.physics.airControl;

  if (movingLeft) { player.vx -= CONFIG.physics.moveAcceleration * control * dt; player.facing = -1; }
  if (movingRight) { player.vx += CONFIG.physics.moveAcceleration * control * dt; player.facing = 1; }
  if (!movingLeft && !movingRight && player.grounded) {
    player.vx *= CONFIG.physics.groundFriction;
    if (Math.abs(player.vx) < 8) player.vx = 0;
  }

  player.vx = clamp(player.vx, -CONFIG.physics.maxMoveSpeed, CONFIG.physics.maxMoveSpeed);
  player.x += player.vx * dt;
  player.x = clamp(player.x, 20, CONFIG.level.worldWidth - player.width - 20);

  player.vy += CONFIG.physics.gravity * dt;
  player.y += player.vy * dt;

  if (player.y + player.height >= groundY) {
    if (!player.grounded) spawnDust(player.x + player.width / 2, groundY, 12);
    player.y = groundY - player.height;
    player.vy = 0;
    player.grounded = true;
  } else {
    player.grounded = false;
  }

  player.runFrame += Math.abs(player.vx) * dt * 0.035;

  for (const obstacle of obstacles) {
    if (rectsOverlap(getPlayerHitbox(), getObstacleHitbox(obstacle))) {
      spawnBurst(player.x + player.width / 2, player.y + player.height / 2, "#ff4d6d", 24);
      endGame(false);
      return;
    }
  }
}

function updateCollectibles(dt) {
  for (const item of collectibles) {
    item.spin += dt * 8;
    if (!item.collected && circleRectOverlap(item, getPlayerHitbox())) {
      item.collected = true;
      votes += 1;
      spawnBurst(item.x, item.y, CONFIG.colors.gold, 20);
      floatingTexts.push({ text: "+1 Vote", x: item.x, y: item.y - 18, vy: -50, life: 0.85 });
    }
  }
}

function updateParticles(dt) {
  for (const p of particles) {
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 900 * dt; p.life -= dt; p.size *= 0.985;
  }
  for (const text of floatingTexts) {
    text.y += text.vy * dt; text.life -= dt;
  }
  particles = particles.filter(p => p.life > 0 && p.size > 0.5);
  floatingTexts = floatingTexts.filter(text => text.life > 0);
}

function updateCamera() {
  const target = player.x - width * 0.35;
  cameraX += (target - cameraX) * 0.16;
  cameraX = clamp(cameraX, 0, Math.max(0, CONFIG.level.worldWidth - width));
}

function jump() {
  if (state === "start") { startGame(); return; }
  if (state !== "running" || !player.grounded) return;
  player.vy = CONFIG.physics.jumpVelocity;
  player.grounded = false;
  spawnDust(player.x + 12, groundY, 8);
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
  return { x: obstacle.x + 11, y: obstacle.y + 10, width: obstacle.width - 22, height: obstacle.height - 20 };
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function circleRectOverlap(circle, rect) {
  const radius = circle.size / 2;
  const closestX = clamp(circle.x, rect.x, rect.x + rect.width);
  const closestY = clamp(circle.y, rect.y, rect.y + rect.height);
  const dx = circle.x - closestX, dy = circle.y - closestY;
  return dx * dx + dy * dy < radius * radius;
}

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

function spawnBurst(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const force = 80 + Math.random() * 220;
    particles.push({ x, y, vx: Math.cos(angle) * force, vy: Math.sin(angle) * force, size: 3 + Math.random() * 6, color, life: 0.45 + Math.random() * 0.45 });
  }
}

function spawnDust(x, y, count) {
  for (let i = 0; i < count; i++) {
    particles.push({ x: x + Math.random() * 24, y: y - 4, vx: -70 - Math.random() * 170, vy: -40 - Math.random() * 70, size: 4 + Math.random() * 7, color: "rgba(247, 215, 148, 0.82)", life: 0.28 + Math.random() * 0.25 });
  }
}

function render() {
  ctx.save();
  drawSky(); drawParallax(); drawGround(); drawFinishLine(); drawCollectibles(); drawObstacles(); drawPlayer(); drawParticles();
  if (CONFIG.debug.showHitboxes) drawHitboxes();
  ctx.restore();
}

function drawSky() {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#171030"); gradient.addColorStop(0.38, "#32205a"); gradient.addColorStop(0.7, "#c76d61"); gradient.addColorStop(1, "#f7d794");
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.9; ctx.fillStyle = "#fff3c4"; ctx.shadowColor = "#fff3c4"; ctx.shadowBlur = 35;
  ctx.beginPath(); ctx.arc(width * 0.78, height * 0.16, 45, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.34; ctx.fillStyle = "#fff";
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
    ctx.save(); ctx.globalAlpha = cloud.alpha; ctx.fillStyle = "#fff"; ctx.translate(screenX, cloud.y); ctx.scale(cloud.scale, cloud.scale); roundedCloud(); ctx.restore();
  }
}

function roundedCloud() {
  ctx.beginPath(); ctx.arc(0, 18, 22, 0, Math.PI * 2); ctx.arc(28, 10, 28, 0, Math.PI * 2); ctx.arc(64, 18, 23, 0, Math.PI * 2); ctx.rect(-5, 18, 76, 24); ctx.fill();
}

function drawMountains(offset, baseY, color, alpha) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(offset, groundY); ctx.lineTo(offset + width * 0.14, baseY + 75); ctx.lineTo(offset + width * 0.25, groundY); ctx.lineTo(offset + width * 0.42, baseY + 20); ctx.lineTo(offset + width * 0.58, groundY); ctx.lineTo(offset + width * 0.76, baseY + 65); ctx.lineTo(offset + width, groundY); ctx.closePath(); ctx.fill(); ctx.restore();
}

function drawHills(offset, y, color, alpha) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(offset + width * 0.28, y + 120, width * 0.45, 155, 0, 0, Math.PI * 2); ctx.ellipse(offset + width * 0.78, y + 145, width * 0.52, 175, 0, 0, Math.PI * 2); ctx.rect(offset, y + 120, width, 260); ctx.fill(); ctx.restore();
}

function drawGround() {
  ctx.fillStyle = "#102822"; ctx.fillRect(0, groundY, width, height - groundY);
  ctx.fillStyle = "#f7d794"; ctx.fillRect(0, groundY, width, 6);
  const stripeOffset = -(cameraX * 0.85) % 66;
  ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = "#f7d794";
  for (let x = stripeOffset - 80; x < width + 80; x += 66) ctx.fillRect(x, groundY + 38, 34, 4);
  ctx.restore();
}

function drawFinishLine() {
  const x = CONFIG.level.finishX - cameraX;
  if (x < -80 || x > width + 80) return;
  ctx.save();
  ctx.fillStyle = "#ffd76a"; ctx.fillRect(x, groundY - 220, 10, 220);
  ctx.fillStyle = "#fff"; ctx.strokeStyle = "#111"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(x + 10, groundY - 220, 115, 58, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#111"; ctx.font = "900 18px Arial"; ctx.textAlign = "center"; ctx.fillText("FINISH", x + 67, groundY - 184);
  ctx.restore();
}

function drawPlayer() {
  drawCharacterShadow(player.x - cameraX, groundY);
  playerImageLoaded ? drawPlayerImage() : drawFallbackPlayer();
}

function drawPlayerImage() {
  const screenX = player.x - cameraX;
  ctx.save();
  ctx.translate(screenX + player.width / 2, player.y + player.height / 2);
  ctx.scale(player.facing, 1);
  ctx.translate(-player.width / 2, -player.height / 2);
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 6;
  ctx.drawImage(assets.player, 0, 0, player.width, player.height);
  ctx.restore();
}

function drawCharacterShadow(screenX, y) {
  ctx.save(); ctx.globalAlpha = 0.24; ctx.fillStyle = "#000"; ctx.beginPath(); ctx.ellipse(screenX + player.width / 2, y + 8, 50, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

function drawFallbackPlayer() {
  const x = player.x - cameraX, y = player.y;
  ctx.save();
  ctx.fillStyle = CONFIG.colors.suit; ctx.strokeStyle = "#111"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(x + 25, y + 48, 58, 68, 14); ctx.fill(); ctx.stroke();
  ctx.fillStyle = CONFIG.colors.skin; ctx.beginPath(); ctx.roundRect(x + 32, y + 5, 46, 48, 18); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#111"; ctx.beginPath(); ctx.roundRect(x + 22, y, 66, 25, 14); ctx.fill();
  ctx.fillStyle = "#f4d35e"; ctx.beginPath(); ctx.roundRect(x + 21, y + 52, 70, 15, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#111"; ctx.font = "900 10px Arial"; ctx.fillText("TVK", x + 46, y + 64);
  ctx.restore();
}

function drawObstacles() {
  for (const obstacle of obstacles) {
    const screenX = obstacle.x - cameraX;
    if (screenX < -220 || screenX > width + 220) continue;
    const img = obstacle.image ? obstacleImages[obstacle.image] : null;
    ctx.save();
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.shadowColor = "rgba(0, 0, 0, 0.35)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6;
      ctx.drawImage(img, screenX, obstacle.y, obstacle.width, obstacle.height);
      ctx.restore();
      continue;
    }
    ctx.fillStyle = obstacle.color || "#e84d5b"; ctx.strokeStyle = "rgba(255,255,255,0.88)"; ctx.lineWidth = 3; ctx.shadowColor = obstacle.color || "#e84d5b"; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.roundRect(screenX, obstacle.y, obstacle.width, obstacle.height, 20); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0; ctx.fillStyle = "#111"; ctx.font = "900 20px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(obstacle.label || "OBS", screenX + obstacle.width / 2, obstacle.y + obstacle.height / 2);
    ctx.restore();
  }
}

function drawCollectibles() {
  for (const item of collectibles) {
    if (item.collected) continue;
    const screenX = item.x - cameraX;
    if (screenX < -100 || screenX > width + 100) continue;
    const radius = item.size / 2, squash = 0.72 + Math.abs(Math.sin(item.spin)) * 0.28;
    ctx.save(); ctx.translate(screenX, item.y); ctx.scale(squash, 1);
    ctx.shadowColor = CONFIG.colors.gold; ctx.shadowBlur = 22; ctx.fillStyle = CONFIG.colors.gold; ctx.strokeStyle = "#111"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0; ctx.fillStyle = "#111"; ctx.font = "900 14px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("+1", 0, 1);
    ctx.restore();
  }
}

function drawParticles() {
  for (const p of particles) {
    ctx.save(); ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x - cameraX, p.y, p.size, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  for (const text of floatingTexts) {
    ctx.save(); ctx.globalAlpha = clamp(text.life, 0, 1); ctx.fillStyle = "#fff"; ctx.strokeStyle = "#111"; ctx.lineWidth = 4; ctx.font = "900 18px Arial"; ctx.textAlign = "center"; ctx.strokeText(text.text, text.x - cameraX, text.y); ctx.fillText(text.text, text.x - cameraX, text.y); ctx.restore();
  }
}

function drawHitboxes() {
  const p = getPlayerHitbox();
  ctx.save(); ctx.lineWidth = 2; ctx.strokeStyle = "lime"; ctx.strokeRect(p.x - cameraX, p.y, p.width, p.height);
  ctx.strokeStyle = "red";
  for (const obstacle of obstacles) { const box = getObstacleHitbox(obstacle); ctx.strokeRect(box.x - cameraX, box.y, box.width, box.height); }
  ctx.restore();
}

if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    this.beginPath(); this.moveTo(x + radius, y); this.arcTo(x + w, y, x + w, y + h, radius); this.arcTo(x + w, y + h, x, y + h, radius); this.arcTo(x, y + h, x, y, radius); this.arcTo(x, y, x + w, y, radius); this.closePath(); return this;
  };
}

function setButtonHeld(button, keyName) {
  const hold = event => { event.preventDefault(); keys[keyName] = true; };
  const release = event => { event.preventDefault(); keys[keyName] = false; };
  button.addEventListener("pointerdown", hold);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
}

function fastTap(button, action) {
  button.addEventListener("pointerdown", event => { event.preventDefault(); action(); });
}

function initGame() {
  loadAssets(); resizeCanvas(); setupAudio(); resetGame(); render();

  fastTap(startBtn, startGame);
  fastTap(restartBtn, restartGame);
  fastTap(resumeBtn, togglePause);
  fastTap(jumpBtn, jump);
  fastTap(musicBtn, toggleMusic);
  setButtonHeld(leftBtn, "left");
  setButtonHeld(rightBtn, "right");

  window.addEventListener("resize", () => { resizeCanvas(); render(); });

  document.addEventListener("keydown", event => {
    if (event.code === "ArrowLeft" || event.code === "KeyA") { event.preventDefault(); keys.left = true; }
    if (event.code === "ArrowRight" || event.code === "KeyD") { event.preventDefault(); keys.right = true; }
    if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") { event.preventDefault(); jump(); }
    if (event.code === "KeyP" || event.code === "Escape") { event.preventDefault(); togglePause(); }
    if (event.code === "KeyM") { event.preventDefault(); toggleMusic(); }
  });

  document.addEventListener("keyup", event => {
    if (event.code === "ArrowLeft" || event.code === "KeyA") { event.preventDefault(); keys.left = false; }
    if (event.code === "ArrowRight" || event.code === "KeyD") { event.preventDefault(); keys.right = false; }
  });

  console.log("The Villupuram Run Platformer: ready");
}

initGame();
