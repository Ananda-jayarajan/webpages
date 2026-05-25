window.GAME_CONFIG = {
  title: "Thalapathy Run",

  physics: {
    gravity: 2250,
    jumpVelocity: -1050,
    moveAcceleration: 4200,
    maxMoveSpeed: 520,
    autoRunSpeed: 360,
    autoRunAcceleration: 2600,
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
      { name: "Cinema Phase", src: "assets/audio/phase1_song.mp3" },
      { name: "Political Phase", src: "assets/audio/phase2_song.mp3" },
      { name: "Government Phase", src: "assets/audio/phase3_song.mp3" },
      { name: "Theme", src: "assets/audio/theme.mp3" },
      { name: "Song 2", src: "assets/audio/song2.mp3" },
      { name: "Song 3", src: "assets/audio/song3.mp3" }
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
        {
          name: "Ajith Fan Storm",
          label: "AK",
          type: "ground",
          image: "assets/obstacles/phase1/ajith_fan_storm.png",
          width: 145,
          height: 125,
          behavior: "bounce"
        },
        {
          name: "Rajini Spotlight",
          label: "SPOT",
          type: "air",
          image: "assets/obstacles/phase1/rajini_spotlight.png",
          width: 160,
          height: 92,
          behavior: "float"
        },
        {
          name: "Box Office Bomb",
          label: "BO",
          type: "ground",
          image: "assets/obstacles/phase1/box_office_bomb.png",
          width: 120,
          height: 120,
          behavior: "pulse"
        },
        {
          name: "Troll Review Cloud",
          label: "TROLL",
          type: "air",
          image: "assets/obstacles/phase1/troll_review_cloud.png",
          width: 170,
          height: 90,
          behavior: "wave"
        },
        {
          name: "Media Mic Trap",
          label: "MIC",
          type: "ground",
          image: "assets/obstacles/phase1/media_mic_trap.png",
          width: 140,
          height: 115,
          behavior: "stretch"
        },
        {
          name: "Political Power Wall",
          label: "POWER",
          type: "ground",
          image: "assets/obstacles/phase1/political_power_wall.png",
          width: 130,
          height: 145,
          behavior: "static"
        },
        {
          name: "Release Clash Gate",
          label: "CLASH",
          type: "ground",
          image: "assets/obstacles/phase1/release_clash_gate.png",
          width: 160,
          height: 130,
          behavior: "pulse"
        },
        {
          name: "Censor Stamp",
          label: "CUT",
          type: "air",
          image: "assets/obstacles/phase1/censor_stamp.png",
          width: 135,
          height: 85,
          behavior: "drop"
        }
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
      musicIndex: 1,
      obstacleCount: 10,

      obstacles: [
        {
          name: "Alliance Table",
          label: "TALK",
          type: "ground",
          image: "assets/obstacles/phase2/alliance_table.png",
          width: 175,
          height: 110,
          behavior: "stretch"
        },
        {
          name: "Seat Sharing Scale",
          label: "SEATS",
          type: "ground",
          image: "assets/obstacles/phase2/seat_sharing_scale.png",
          width: 155,
          height: 125,
          behavior: "bounce"
        },
        {
          name: "Debate Anchor Trap",
          label: "LIVE",
          type: "ground",
          image: "assets/obstacles/phase2/debate_anchor.png",
          width: 150,
          height: 115,
          behavior: "flash"
        },
        {
          name: "Meme Tornado",
          label: "MEME",
          type: "air",
          image: "assets/obstacles/phase2/meme_tornado.png",
          width: 140,
          height: 130,
          behavior: "wave"
        },
        {
          name: "Manifesto Scroll",
          label: "PLAN",
          type: "ground",
          image: "assets/obstacles/phase2/manifesto_scroll.png",
          width: 160,
          height: 100,
          behavior: "roll"
        },
        {
          name: "Vote Split Pit",
          label: "SPLIT",
          type: "ground",
          image: "assets/obstacles/phase2/vote_split_pit.png",
          width: 150,
          height: 95,
          behavior: "static"
        },
        {
          name: "Governor Gate",
          label: "GATE",
          type: "ground",
          image: "assets/obstacles/phase2/governor_gate.png",
          width: 170,
          height: 165,
          behavior: "pulse"
        }
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
      musicIndex: 2,
      obstacleCount: 9,

      obstacles: [
        {
          name: "Budget File Mountain",
          label: "BUDGET",
          type: "ground",
          image: "assets/obstacles/phase3/budget_files.png",
          width: 155,
          height: 145,
          behavior: "static"
        },
        {
          name: "Bureaucracy Maze",
          label: "FILES",
          type: "ground",
          image: "assets/obstacles/phase3/bureaucracy_maze.png",
          width: 170,
          height: 120,
          behavior: "stretch"
        },
        {
          name: "Protest Wave",
          label: "PROTEST",
          type: "ground",
          image: "assets/obstacles/phase3/protest_wave.png",
          width: 180,
          height: 118,
          behavior: "wave"
        },
        {
          name: "Media Heat",
          label: "MEDIA",
          type: "air",
          image: "assets/obstacles/phase3/media_heat.png",
          width: 165,
          height: 92,
          behavior: "flash"
        },
        {
          name: "Corruption Trap",
          label: "TRAP",
          type: "ground",
          image: "assets/obstacles/phase3/corruption_trap.png",
          width: 150,
          height: 105,
          behavior: "pulse"
        },
        {
          name: "Opposition Debate Wall",
          label: "DEBATE",
          type: "ground",
          image: "assets/obstacles/phase3/opposition_wall.png",
          width: 170,
          height: 135,
          behavior: "bounce"
        },
        {
          name: "Welfare Delivery Truck",
          label: "WELFARE",
          type: "ground",
          image: "assets/obstacles/phase3/welfare_truck.png",
          width: 180,
          height: 110,
          behavior: "roll"
        }
      ]
    }
  ]
};
