window.GAME_CONFIG = {
  title: "The Villupuram Run Pro",

  physics: {
    gravity: 2450,
    jumpVelocity: -890,
    groundFriction: 0.88,
    slideDuration: 0.62
  },

  difficulty: {
    startSpeed: 420,
    maxSpeed: 980,
    speedGainPerSecond: 7.5,
    obstacleBaseGap: 720,
    obstacleRandomGap: 520
  },

  player: {
    x: 118,

    // Put the image here:
    // assets/characters/vijay.png
    image: "assets/characters/vijay.png",

    // Adjust if the image looks too small or too large.
    width: 105,
    height: 142,

    slideHeight: 72,

    hitboxPaddingX: 24,
    hitboxPaddingTop: 18,
    hitboxPaddingBottom: 10
  },

  scoring: {
    distanceMultiplier: 0.055,
    voteValue: 10,
    obstacleClearValue: 15
  },

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

  collectible: {
    size: 34,
    glowSize: 18
  },

  debug: {
    showHitboxes: false
  }
};
