import { CONFIG } from './config.js';

export class StatsSystem {
  constructor(storage) {
    this.storage = storage;
    this.game = null;
    this.sessionStats = null;
    this._onStatsChange = null;
    this.loadStats();
  }

  loadStats() {
    const saved = this.storage.get(CONFIG.storage.statsKey, null);
    if (saved) {
      this.stats = saved;
    } else {
      this.stats = {
        totalGames: 0,
        totalStars: 0,
        totalCollisions: 0,
        highestLevel: 1,
        totalPowerUps: 0,
        longestSurvivalTime: 0,
        lastUpdated: Date.now()
      };
      this.saveStats();
    }
  }

  saveStats() {
    this.stats.lastUpdated = Date.now();
    this.storage.set(CONFIG.storage.statsKey, this.stats);
  }

  onRegister(game) {
    this.game = game;
  }

  onStatsChange(callback) {
    this._onStatsChange = callback;
  }

  notifyStatsChange() {
    if (this._onStatsChange) {
      this._onStatsChange({ ...this.stats });
    }
  }

  startNewSession() {
    this.sessionStats = {
      stars: 0,
      collisions: 0,
      powerUps: 0,
      maxLevel: 1,
      startTime: Date.now(),
      survivalTime: 0
    };
  }

  updateSessionLevel(level) {
    if (this.sessionStats && level > this.sessionStats.maxLevel) {
      this.sessionStats.maxLevel = level;
    }
  }

  notify(event, value = 1) {
    if (!this.sessionStats) return;

    switch (event) {
      case 'star_collected':
        this.sessionStats.stars += value;
        break;
      case 'collision':
        this.sessionStats.collisions += value;
        break;
      case 'powerup_picked':
        this.sessionStats.powerUps += value;
        break;
    }
  }

  endSession() {
    if (!this.sessionStats) return;

    this.sessionStats.survivalTime = Date.now() - this.sessionStats.startTime;

    this.stats.totalGames += 1;
    this.stats.totalStars += this.sessionStats.stars;
    this.stats.totalCollisions += this.sessionStats.collisions;
    this.stats.totalPowerUps += this.sessionStats.powerUps;

    if (this.sessionStats.maxLevel > this.stats.highestLevel) {
      this.stats.highestLevel = this.sessionStats.maxLevel;
    }

    if (this.sessionStats.survivalTime > this.stats.longestSurvivalTime) {
      this.stats.longestSurvivalTime = this.sessionStats.survivalTime;
    }

    this.saveStats();
    this.notifyStatsChange();

    const sessionResult = { ...this.sessionStats };
    this.sessionStats = null;
    return sessionResult;
  }

  getStats() {
    return { ...this.stats };
  }

  formatSurvivalTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}分${remainingSeconds}秒`;
    }
    return `${remainingSeconds}秒`;
  }

  reset() {
    this.stats = {
      totalGames: 0,
      totalStars: 0,
      totalCollisions: 0,
      highestLevel: 1,
      totalPowerUps: 0,
      longestSurvivalTime: 0,
      lastUpdated: Date.now()
    };
    this.saveStats();
    this.notifyStatsChange();
  }
}
