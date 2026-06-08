import { CollisionDetector } from './collision.js';

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

  render(ctx) {
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const t = this.trail[i];
      const alpha = (1 - i / this.trail.length) * 0.3;
      const size = this.size * (1 - i / this.trail.length * 0.5);
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.config.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    if (this.hitFlash > 0) {
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#ef4444';
    } else {
      ctx.shadowBlur = 25;
      ctx.shadowColor = this.config.glowColor;
    }

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size / 2);
    gradient.addColorStop(0, '#c7d2fe');
    gradient.addColorStop(0.3, this.config.color);
    gradient.addColorStop(1, '#4338ca');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(-this.size / 6, -this.size / 6, this.size / 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, this.size / 2 + 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
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
