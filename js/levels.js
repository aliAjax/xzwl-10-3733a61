export class LevelSystem {
  constructor(levelsConfig) {
    this.levels = levelsConfig;
    this.currentLevel = 0;
    this.game = null;
    this.onLevelChange = null;
  }

  onRegister(game) {
    this.game = game;
    this.reset();
  }

  reset() {
    this.currentLevel = 0;
    console.log(`[LevelSystem] reset: level = ${this.currentLevel + 1}`);
    if (this.onLevelChange) {
      this.onLevelChange(this.currentLevel + 1);
    }
  }

  update(deltaTime) {
    if (!this.game || !this.game.scoreManager) return;

    const currentScore = this.game.scoreManager.getScore();
    const newLevel = this.calculateLevel(currentScore);

    if (newLevel !== this.currentLevel) {
      const oldLevel = this.currentLevel + 1;
      this.currentLevel = newLevel;
      const newLevelNum = this.currentLevel + 1;
      console.log(`[LevelSystem] level up: ${oldLevel} → ${newLevelNum} (score: ${currentScore})`);
      this.applyLevelChanges();
      if (this.onLevelChange) {
        this.onLevelChange(newLevelNum);
      }
    }
  }

  calculateLevel(score) {
    let level = 0;
    for (let i = this.levels.length - 1; i >= 0; i--) {
      if (score >= this.levels[i].threshold) {
        level = i;
        break;
      }
    }
    return level;
  }

  applyLevelChanges() {
    this.updateExistingObstacles();
  }

  updateExistingObstacles() {
    if (!this.game || !this.game.entities) return;

    const newSpeed = this.getObstacleSpeed();
    this.game.entities.forEach(entity => {
      if (entity.type === 'obstacle' && entity.active) {
        const currentSpeed = Math.sqrt(entity.vx * entity.vx + entity.vy * entity.vy);
        if (currentSpeed > 0) {
          const ratio = newSpeed / currentSpeed;
          entity.vx *= ratio;
          entity.vy *= ratio;
        }
      }
    });
  }

  getCurrentLevelConfig() {
    return this.levels[this.currentLevel] || this.levels[0];
  }

  getSpawnInterval(entityType) {
    const config = this.getCurrentLevelConfig();
    if (entityType === 'star') {
      return config.starInterval;
    } else if (entityType === 'obstacle') {
      return this.game.config.obstacle.spawnInterval;
    }
    return 2000;
  }

  getMaxCount(entityType) {
    const config = this.getCurrentLevelConfig();
    if (entityType === 'star') {
      return config.maxStars;
    } else if (entityType === 'obstacle') {
      return config.maxObstacles;
    }
    return 3;
  }

  getObstacleSpeed() {
    const config = this.getCurrentLevelConfig();
    return config.obstacleSpeed;
  }

  getLevel() {
    return this.currentLevel + 1;
  }

  getNextThreshold() {
    if (this.currentLevel < this.levels.length - 1) {
      return this.levels[this.currentLevel + 1].threshold;
    }
    return null;
  }
}
