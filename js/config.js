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
    settingsKey: 'starCollector_settings'
  },
  levels: [],
  powerUps: [],
  achievements: []
};

export const GAME_STATES = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameover'
};
