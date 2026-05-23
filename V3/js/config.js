window.GAME_CONFIG = {
  title: "The Villupuram Run Pro",

  physics: {
    gravity: 2450,
    jumpVelocity: -890,
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
    size: 34
  },

  debug: {
    showHitboxes: false
  }
};
