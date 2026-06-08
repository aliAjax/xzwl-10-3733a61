import { CollisionDetector } from './collision.js';
import { PowerUp } from './entities.js';

export class PowerUpSystem {
  constructor(config) {
    this.config = config;
    this.game = null;
    this.spawnTimer = 0;
    this.activeEffects = [];
    this.pickupEffects = [];
    this.powerUpTypes = Object.keys(config.types);
  }

  onRegister(game) {
    this.game = game;
  }

  reset() {
    this.spawnTimer = 0;
    this.activeEffects = [];
    this.pickupEffects = [];
  }

  update(deltaTime) {
    this.activeEffects = this.activeEffects.filter(effect => {
      effect.remaining -= deltaTime;
      if (effect.remaining <= 0) {
        this.removeEffect(effect);
        return false;
      }
      return true;
    });

    this.pickupEffects = this.pickupEffects.filter(effect => {
      effect.lifetime -= deltaTime;
      return effect.lifetime > 0;
    });
  }

  trySpawn(deltaTime, entities) {
    this.spawnTimer += deltaTime;
    
    const powerUpCount = entities.filter(e => e.type === 'powerup' && e.active).length;
    
    if (this.spawnTimer >= this.config.spawnInterval && powerUpCount < this.config.maxCount) {
      this.spawnTimer = 0;
      this.spawnPowerUp(entities);
    }
  }

  spawnPowerUp(entities) {
    const padding = 60;
    const x = padding + Math.random() * (this.game.width - padding * 2);
    const y = padding + Math.random() * (this.game.height - padding * 2);
    
    const type = this.powerUpTypes[Math.floor(Math.random() * this.powerUpTypes.length)];
    const typeConfig = { ...this.config.types[type], lifetime: this.config.lifetime };
    
    const powerUp = new PowerUp(x, y, type, typeConfig);
    entities.push(powerUp);
  }

  checkCollisions(player, entities) {
    const playerBounds = player.getBounds();
    
    for (const entity of entities) {
      if (!entity.active || entity.type !== 'powerup') continue;
      
      const entityBounds = entity.getBounds();
      if (CollisionDetector.checkCircle(playerBounds, entityBounds)) {
        const result = entity.onCollide(player);
        if (result) {
          this.applyPowerUp(result.powerUpType, result.config, player);
          this.addPickupEffect(entity.x, entity.y, result.config);
        }
      }
    }
  }

  applyPowerUp(type, config, player) {
    switch (type) {
      case 'shield':
        this.applyShield(player, config);
        break;
      case 'speed':
        this.applySpeed(player, config);
        break;
      case 'heal':
        this.applyHeal(player, config);
        break;
    }
  }

  applyShield(player, config) {
    const existing = this.activeEffects.find(e => e.type === 'shield');
    if (existing) {
      existing.remaining = config.duration;
    } else {
      player.setShield(true);
      this.activeEffects.push({
        type: 'shield',
        config: config,
        remaining: config.duration,
        player: player
      });
    }
  }

  applySpeed(player, config) {
    const existing = this.activeEffects.find(e => e.type === 'speed');
    if (existing) {
      existing.remaining = config.duration;
    } else {
      player.setSpeedMultiplier(config.multiplier);
      this.activeEffects.push({
        type: 'speed',
        config: config,
        remaining: config.duration,
        player: player
      });
    }
  }

  applyHeal(player, config) {
    player.heal(config.healAmount);
    if (this.game.onLivesChange) {
      this.game.onLivesChange(player.getLives());
    }
  }

  removeEffect(effect) {
    switch (effect.type) {
      case 'shield':
        effect.player.setShield(false);
        break;
      case 'speed':
        effect.player.setSpeedMultiplier(1);
        break;
    }
  }

  addPickupEffect(x, y, config) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      this.pickupEffects.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        color: config.color,
        size: 6,
        lifetime: 500,
        maxLifetime: 500
      });
    }
  }

  renderEffects(ctx) {
    this.activeEffects.forEach(effect => {
      this.renderActiveEffect(ctx, effect);
    });
    
    this.pickupEffects.forEach(effect => {
      this.renderPickupEffect(ctx, effect);
    });
  }

  renderActiveEffect(ctx, effect) {
    if (effect.type === 'shield') {
      const player = effect.player;
      const time = Date.now() * 0.003;
      const alpha = 0.3 + Math.sin(time) * 0.1;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = effect.config.color;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = effect.config.glowColor;
      
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.size / 2 + 8, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = effect.config.color;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.size / 2 + 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (effect.type === 'speed') {
      const player = effect.player;
      const time = Date.now() * 0.005;
      
      ctx.save();
      for (let i = 0; i < 3; i++) {
        const alpha = 0.4 - i * 0.12;
        const offsetX = -Math.cos(time + i) * 8;
        const offsetY = -Math.sin(time + i) * 8;
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = effect.config.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = effect.config.glowColor;
        
        ctx.beginPath();
        ctx.arc(player.x + offsetX, player.y + offsetY, player.size / 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    
    this.renderEffectTimer(ctx, effect);
  }

  renderEffectTimer(ctx, effect) {
    const player = effect.player;
    const progress = effect.remaining / effect.config.duration;
    const radius = player.size / 2 + 15;
    
    ctx.save();
    ctx.translate(player.x, player.y);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.strokeStyle = effect.config.color;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 8;
    ctx.shadowColor = effect.config.glowColor;
    ctx.beginPath();
    ctx.arc(0, 0, radius, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  }

  renderPickupEffect(ctx, effect) {
    const alpha = effect.lifetime / effect.maxLifetime;
    const size = effect.size * alpha;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = effect.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = effect.color;
    
    effect.x += effect.vx;
    effect.y += effect.vy;
    effect.vx *= 0.95;
    effect.vy *= 0.95;
    
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  modifyEntity(entity) {
  }
}
