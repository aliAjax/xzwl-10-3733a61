export const CONFIG = {
  game: {
    canvasWidth: 800,
    canvasHeight: 600,
    fps: 60,
    initialLives: 3,
    backgroundStars: 100
  },
  player: {
    size: 20,
    speed: 5,
    color: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.6)',
    trailLength: 8
  },
  star: {
    size: 15,
    points: 10,
    spawnInterval: 1500,
    maxCount: 5,
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.6)'
  },
  obstacle: {
    size: 25,
    damage: 1,
    spawnInterval: 2000,
    maxCount: 3,
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    speed: 2
  },
  storage: {
    highScoreKey: 'starCollector_highScore',
    achievementsKey: 'starCollector_achievements',
    settingsKey: 'starCollector_settings',
    dailyChallengesKey: 'starCollector_dailyChallenges',
    statsKey: 'starCollector_stats',
    skinsKey: 'starCollector_skins'
  },
  levels: [
    { threshold: 0, starInterval: 1500, maxStars: 5, maxObstacles: 3, obstacleSpeed: 2 },
    { threshold: 100, starInterval: 1300, maxStars: 6, maxObstacles: 4, obstacleSpeed: 2.5 },
    { threshold: 250, starInterval: 1100, maxStars: 7, maxObstacles: 5, obstacleSpeed: 3 },
    { threshold: 500, starInterval: 950, maxStars: 8, maxObstacles: 6, obstacleSpeed: 3.5 },
    { threshold: 800, starInterval: 800, maxStars: 9, maxObstacles: 7, obstacleSpeed: 4 },
    { threshold: 1200, starInterval: 700, maxStars: 10, maxObstacles: 8, obstacleSpeed: 4.5 },
    { threshold: 1700, starInterval: 600, maxStars: 11, maxObstacles: 9, obstacleSpeed: 5 },
    { threshold: 2300, starInterval: 500, maxStars: 12, maxObstacles: 10, obstacleSpeed: 5.5 }
  ],
  powerUps: {
    spawnInterval: 5000,
    maxCount: 2,
    lifetime: 8000,
    types: {
      shield: {
        name: '护盾',
        size: 22,
        duration: 5000,
        color: '#22c55e',
        glowColor: 'rgba(34, 197, 94, 0.6)',
        symbol: '🛡️'
      },
      speed: {
        name: '加速',
        size: 20,
        duration: 6000,
        color: '#3b82f6',
        glowColor: 'rgba(59, 130, 246, 0.6)',
        multiplier: 1.8,
        symbol: '⚡'
      },
      heal: {
        name: '回血',
        size: 20,
        duration: 0,
        healAmount: 1,
        color: '#ec4899',
        glowColor: 'rgba(236, 72, 153, 0.6)',
        symbol: '❤️'
      }
    }
  },
  achievements: []
};

export const GAME_STATES = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameover',
  TRAINING: 'training',
  REPLAY: 'replay'
};

export const TRAINING_PRESETS = {
  easy: {
    name: '新手练习',
    description: '慢速生成，适合熟悉操作',
    starInterval: 2500,
    maxStars: 3,
    obstacleInterval: 4000,
    maxObstacles: 2,
    obstacleSpeed: 1,
    powerUpInterval: 4000,
    maxPowerUps: 2
  },
  normal: {
    name: '进阶训练',
    description: '中等难度，接近正式游戏',
    starInterval: 1500,
    maxStars: 5,
    obstacleInterval: 2000,
    maxObstacles: 3,
    obstacleSpeed: 2,
    powerUpInterval: 5000,
    maxPowerUps: 2
  },
  intense: {
    name: '高强度',
    description: '密集生成，锻炼反应能力',
    starInterval: 800,
    maxStars: 8,
    obstacleInterval: 1000,
    maxObstacles: 6,
    obstacleSpeed: 3.5,
    powerUpInterval: 3500,
    maxPowerUps: 3
  },
  obstacle_only: {
    name: '闪避大师',
    description: '只有陨石，练习躲避技巧',
    starInterval: 3000,
    maxStars: 2,
    obstacleInterval: 800,
    maxObstacles: 10,
    obstacleSpeed: 4,
    powerUpInterval: 3000,
    maxPowerUps: 2
  },
  star_only: {
    name: '收集达人',
    description: '星星很多，练习快速收集',
    starInterval: 500,
    maxStars: 15,
    obstacleInterval: 5000,
    maxObstacles: 1,
    obstacleSpeed: 1.5,
    powerUpInterval: 4000,
    maxPowerUps: 2
  },
  powerup_fun: {
    name: '道具狂欢',
    description: '大量道具，体验各种效果',
    starInterval: 1500,
    maxStars: 5,
    obstacleInterval: 3000,
    maxObstacles: 3,
    obstacleSpeed: 2,
    powerUpInterval: 1500,
    maxPowerUps: 5
  }
};

export const SKINS = [
  {
    id: 'classic',
    name: '经典蓝',
    description: '游戏初始皮肤，永恒的星际蓝',
    icon: '🔵',
    player: {
      color: '#6366f1',
      glowColor: 'rgba(99, 102, 241, 0.6)',
      innerColor: '#c7d2fe',
      outerColor: '#4338ca',
      shape: 'circle'
    },
    trail: {
      color: '#6366f1',
      length: 8
    },
    pickupEffect: {
      type: 'sparkle',
      color: '#fbbf24',
      particleCount: 8
    },
    unlock: {
      type: 'default'
    }
  },
  {
    id: 'emerald',
    name: '翡翠绿',
    description: '如翡翠般清新自然的配色',
    icon: '💚',
    player: {
      color: '#10b981',
      glowColor: 'rgba(16, 185, 129, 0.6)',
      innerColor: '#a7f3d0',
      outerColor: '#047857',
      shape: 'circle'
    },
    trail: {
      color: '#10b981',
      length: 10
    },
    pickupEffect: {
      type: 'sparkle',
      color: '#10b981',
      particleCount: 10
    },
    unlock: {
      type: 'default'
    }
  },
  {
    id: 'sunset',
    name: '落日橙',
    description: '温暖如落日余晖的橙红配色',
    icon: '🧡',
    player: {
      color: '#f97316',
      glowColor: 'rgba(249, 115, 22, 0.6)',
      innerColor: '#fed7aa',
      outerColor: '#c2410c',
      shape: 'star'
    },
    trail: {
      color: '#f97316',
      length: 12
    },
    pickupEffect: {
      type: 'explosion',
      color: '#f97316',
      particleCount: 12
    },
    unlock: {
      type: 'score',
      value: 300,
      description: '单局达到300分解锁'
    }
  },
  {
    id: 'royal',
    name: '皇家紫',
    description: '高贵典雅的皇家紫色，需要成就解锁',
    icon: '💜',
    player: {
      color: '#8b5cf6',
      glowColor: 'rgba(139, 92, 246, 0.6)',
      innerColor: '#ddd6fe',
      outerColor: '#6d28d9',
      shape: 'diamond'
    },
    trail: {
      color: '#8b5cf6',
      length: 15
    },
    pickupEffect: {
      type: 'ring',
      color: '#8b5cf6',
      particleCount: 16
    },
    unlock: {
      type: 'achievement',
      value: 'score_100',
      description: '解锁"百分达人"成就后获得'
    }
  },
  {
    id: 'rainbow',
    name: '彩虹传说',
    description: '传说中的彩虹皮肤，只有真正的高手才能解锁',
    icon: '🌈',
    player: {
      color: '#ec4899',
      glowColor: 'rgba(236, 72, 153, 0.6)',
      innerColor: '#fbcfe8',
      outerColor: '#be185d',
      shape: 'rainbow',
      rainbow: true
    },
    trail: {
      color: '#ec4899',
      length: 20,
      rainbow: true
    },
    pickupEffect: {
      type: 'rainbow',
      color: '#ec4899',
      particleCount: 20
    },
    unlock: {
      type: 'highscore',
      value: 500,
      description: '最高分达到500解锁'
    }
  }
];
