window.GAME_CONFIG = {
  title: "The Villupuram Run Platformer",

  physics: {
    gravity: 2250,
    jumpVelocity: -1050,
    moveAcceleration: 4200,
    maxMoveSpeed: 520,
    groundFriction: 0.82,
    airControl: 0.72
  },

  level: {
    worldWidth: 7200,
    startX: 140,
    finishX: 6900,
    obstacleCount: 18,
    voteCount: 30,
    minObstacleGap: 260
  },

  player: {
    width: 120,
    height: 155,
    slideHeight: 92,

    // fallback image only if animation frames are missing
    image: "assets/characters/vijay.png",

    // visual adjustment so Vijay sits a bit lower on the floor
    visualOffsetY: 12,

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
      width: isAir ? 170 : 118,
      height: isAir ? 82 : 118,
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
