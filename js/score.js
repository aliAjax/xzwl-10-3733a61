import { CONFIG } from './config.js';

export class ScoreManager {
  constructor(storage) {
    this.storage = storage;
    this.score = 0;
    this.highScore = this.loadHighScore();
    this._onScoreChange = null;
  }

  loadHighScore() {
    return this.storage.get(CONFIG.storage.highScoreKey, 0);
  }

  saveHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.storage.set(CONFIG.storage.highScoreKey, this.highScore);
      return true;
    }
    return false;
  }

  addScore(points) {
    const oldScore = this.score;
    this.score += points;
    console.log(`[ScoreManager] addScore: ${oldScore} + ${points} = ${this.score}`);
    if (this._onScoreChange) {
      this._onScoreChange(this.score);
    }
  }

  getScore() {
    return this.score;
  }

  getHighScore() {
    return this.highScore;
  }

  reset() {
    this.score = 0;
    console.log(`[ScoreManager] reset: score = ${this.score}`);
    if (this._onScoreChange) {
      this._onScoreChange(this.score);
    }
  }

  onScoreChange(callback) {
    this._onScoreChange = callback;
  }
}
