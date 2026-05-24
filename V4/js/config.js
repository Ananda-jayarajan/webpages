window.GAME_CONFIG = {
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
  enabled: true,
  volume: 0.45,
  loop: true,
  pauseWhenPaused: true,
  continueAfterGameOver: false,

  playlist: [
    {
      name: "Theme",
      src: "assets/audio/theme.mp3"
    },
    {
      name: "Song 2",
      src: "assets/audio/song2.mp3"
    },
    {
      name: "Song 3",
      src: "assets/audio/song3.mp3"
    },
    {
      name: "Song 4",
      src: "assets/audio/song4.mp3"
    }
  ]
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
