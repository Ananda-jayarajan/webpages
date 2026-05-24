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

    // Increase to 42 or 46 if Vijay still looks floating.
    visualOffsetY: 38,

    // Smaller hitbox so game over happens only when he really hits.
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
