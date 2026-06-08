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
  powerUps: [],
  achievements: []
};

export const GAME_STATES = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameover'
};
