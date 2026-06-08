import { CollisionDetector } from './collision.js';
import { SkinRenderer } from './skins.js';

export class Player {
  constructor(x, y, config, bounds) {
    this.type = 'player';
    this.x = x;
    this.y = y;
    this.config = config;
    this.size = config.size;
    this.baseSpeed = config.speed;
    this.speed = config.speed;
    this.speedMultiplier = 1;
    this.settingsSpeedMultiplier = 1;
    this.bounds = bounds;
    this.lives = 3;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.shield = false;
    this.trail = [];
    this.hitFlash = 0;
  }

  move(dx, dy, deltaTime) {
    const moveSpeed = this.speed * this.speedMultiplier * this.settingsSpeedMultiplier;
    this.x += dx * moveSpeed;
    this.y += dy * moveSpeed;

    CollisionDetector.clampToBounds(this, this.bounds);

    if (dx !== 0 || dy !== 0) {
      this.trail.unshift({ x: this.x, y: this.y });
      if (this.trail.length > this.config.trailLength) {
        this.trail.pop();
      }
    }
  }

  update(deltaTime) {
    if (this.invincible) {
      this.invincibleTimer -= deltaTime;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
      }
    }

    if (this.hitFlash > 0) {
      this.hitFlash -= deltaTime;
    }
  }

  render(ctx, skin = null) {
    if (skin) {
      SkinRenderer.renderPlayer(ctx, this, skin);
    } else {
      SkinRenderer.renderDefaultPlayer(ctx, this);
    }
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      size: this.size
    };
  }

  takeDamage(amount) {
    if (this.shield) return false;
    if (this.invincible) return false;
    
    this.lives -= amount;
    this.invincible = true;
    this.invincibleTimer = 1500;
    this.hitFlash = 300;
    
    return true;
  }

  heal(amount) {
    this.lives = Math.min(this.lives + amount, 5);
  }

  setShield(active) {
    this.shield = active;
  }

  setSpeedMultiplier(multiplier) {
    this.speedMultiplier = multiplier;
  }

  setSettingsSpeedMultiplier(multiplier) {
    this.settingsSpeedMultiplier = multiplier;
  }

  getLives() {
    return this.lives;
  }

  setLives(lives) {
    this.lives = lives;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.lives = 3;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.shield = false;
    this.speedMultiplier = 1;
    this.trail = [];
    this.hitFlash = 0;
  }
}
