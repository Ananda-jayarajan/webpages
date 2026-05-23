window.GAME_CONFIG = {
  title: "The Villupuram Run Pro",

physics: {
  gravity: 2250,
  jumpVelocity: -1000,
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

obstacles: Array.from({ length: 20 }, (_, i) => {
  const n = i + 1;
  const isAir = n % 5 === 0;

  return {
    name: `Obstacle ${n}`,
    type: isAir ? "air" : "ground",
    width: isAir ? 120 : 82,
    height: isAir ? 58 : 82,
    color: "#e84d5b",
    label: String(n),
    image: `assets/obstacles/${n}.png`
  };
}),

  collectible: {
    size: 34
  },

  debug: {
    showHitboxes: false
  }
};
