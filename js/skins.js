import { CONFIG, SKINS } from './config.js';

export const DEFAULT_SKIN_ID = 'classic';

export class SkinManager {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.skins = SKINS;
    this.storageKey = CONFIG.storage.skinsKey;
    
    this.unlockedSkins = {};
    this.selectedSkinIds = {
      player: DEFAULT_SKIN_ID,
      trail: DEFAULT_SKIN_ID,
      effect: DEFAULT_SKIN_ID
    };
    this.changeCallbacks = [];
    
    this.load();
  }

  load() {
    try {
      const saved = this.storageManager.get(this.storageKey, null);
      if (saved) {
        this.unlockedSkins = saved.unlocked || {};
        const legacyCurrent = saved.current || DEFAULT_SKIN_ID;
        this.selectedSkinIds = {
          player: saved.selected?.player || legacyCurrent,
          trail: saved.selected?.trail || legacyCurrent,
          effect: saved.selected?.effect || legacyCurrent
        };
      }
      
      const defaultSkins = this.skins.filter(s => s.unlock.type === 'default');
      defaultSkins.forEach(skin => {
        if (!this.unlockedSkins[skin.id]) {
          this.unlockedSkins[skin.id] = { unlockedAt: Date.now() };
        }
      });

      this.ensureValidSelections();
      
      this.save();
    } catch (e) {
      console.warn('加载皮肤数据失败，使用默认皮肤:', e);
      this.unlockedSkins = {};
      this.selectedSkinIds = {
        player: DEFAULT_SKIN_ID,
        trail: DEFAULT_SKIN_ID,
        effect: DEFAULT_SKIN_ID
      };
      const defaultSkins = this.skins.filter(s => s.unlock.type === 'default');
      defaultSkins.forEach(skin => {
        this.unlockedSkins[skin.id] = { unlockedAt: Date.now() };
      });
    }
  }

  ensureValidSelections() {
    ['player', 'trail', 'effect'].forEach(category => {
      const selectedId = this.selectedSkinIds[category];
      if (!this.isUnlocked(selectedId)) {
        this.selectedSkinIds[category] = DEFAULT_SKIN_ID;
      }
    });
  }

  save() {
    try {
      this.storageManager.set(this.storageKey, {
        unlocked: this.unlockedSkins,
        current: this.selectedSkinIds.player,
        selected: this.selectedSkinIds
      });
      return true;
    } catch (e) {
      console.warn('保存皮肤数据失败:', e);
      return false;
    }
  }

  checkUnlocks(gameState, achievementSystem, scoreManager) {
    const newlyUnlocked = [];
    
    for (const skin of this.skins) {
      if (this.isUnlocked(skin.id)) continue;
      
      const unlock = skin.unlock;
      let isUnlocked = false;
      
      switch (unlock.type) {
        case 'default':
          isUnlocked = true;
          break;
        case 'score':
          if (gameState && gameState.currentScore >= unlock.value) {
            isUnlocked = true;
          }
          break;
        case 'highscore':
          if (scoreManager && scoreManager.getHighScore() >= unlock.value) {
            isUnlocked = true;
          }
          break;
        case 'achievement':
          if (achievementSystem && achievementSystem.isUnlocked(unlock.value)) {
            isUnlocked = true;
          }
          break;
      }
      
      if (isUnlocked) {
        this.unlockSkin(skin.id);
        newlyUnlocked.push(skin);
      }
    }
    
    return newlyUnlocked;
  }

  unlockSkin(skinId) {
    if (this.isUnlocked(skinId)) return false;
    
    const skin = this.getSkin(skinId);
    if (!skin) return false;
    
    this.unlockedSkins[skinId] = {
      unlockedAt: Date.now()
    };
    
    this.save();
    this.notifyChange('unlock', skinId, skin);
    return true;
  }

  selectSkin(skinId, category = 'player') {
    if (!this.isUnlocked(skinId)) return false;
    if (!['player', 'trail', 'effect'].includes(category)) return false;
    
    const oldSkinId = this.selectedSkinIds[category];
    this.selectedSkinIds[category] = skinId;
    this.save();
    this.notifyChange('select', { category, skinId }, oldSkinId);
    return true;
  }

  getCurrentSkin() {
    const playerSkin = this.getSelectedSkin('player');
    const trailSkin = this.getSelectedSkin('trail');
    const effectSkin = this.getSelectedSkin('effect');

    return {
      ...playerSkin,
      player: playerSkin.player,
      trail: trailSkin.trail,
      pickupEffect: effectSkin.pickupEffect,
      selected: { ...this.selectedSkinIds }
    };
  }

  getSelectedSkin(category = 'player') {
    return this.getSkin(this.selectedSkinIds[category]) || this.getSkin(DEFAULT_SKIN_ID);
  }

  getCurrentSkinId(category = 'player') {
    return this.selectedSkinIds[category] || DEFAULT_SKIN_ID;
  }

  getCurrentSelectionIds() {
    return { ...this.selectedSkinIds };
  }

  getSkin(skinId) {
    return this.skins.find(s => s.id === skinId) || null;
  }

  getAllSkins(category = 'player') {
    return this.skins.map(skin => ({
      ...skin,
      unlocked: this.isUnlocked(skin.id),
      selected: this.isSelected(skin.id, category),
      unlockedAt: this.unlockedSkins[skin.id]?.unlockedAt || null
    }));
  }

  getUnlockedSkins() {
    return this.skins.filter(skin => this.isUnlocked(skin.id));
  }

  isUnlocked(skinId) {
    return !!this.unlockedSkins[skinId];
  }

  isSelected(skinId, category = 'player') {
    return this.selectedSkinIds[category] === skinId;
  }

  getUnlockProgress(skinId) {
    const skin = this.getSkin(skinId);
    if (!skin || this.isUnlocked(skinId)) return { current: 100, total: 100, percent: 100 };
    
    const unlock = skin.unlock;
    let current = 0;
    let total = unlock.value || 1;
    
    switch (unlock.type) {
      case 'score':
        current = window.__game?.getScore() || 0;
        break;
      case 'highscore':
        current = window.__scoreManager?.getHighScore() || 0;
        break;
      case 'achievement':
        current = window.__achievementSystem?.isUnlocked(unlock.value) ? 1 : 0;
        total = 1;
        break;
    }
    
    const percent = Math.min(100, Math.round((current / total) * 100));
    return { current, total, percent };
  }

  onChange(callback) {
    if (typeof callback === 'function') {
      this.changeCallbacks.push(callback);
    }
  }

  notifyChange(type, newValue, oldValue) {
    this.changeCallbacks.forEach(cb => {
      try {
        cb(type, newValue, oldValue);
      } catch (e) {
        console.error('皮肤变更回调执行失败:', e);
      }
    });
  }

  applySkinToPlayer(player) {
    const playerSkin = this.getSelectedSkin('player');
    const trailSkin = this.getSelectedSkin('trail');
    if (!playerSkin || !trailSkin || !player) return;
    
    player.config = {
      ...player.config,
      color: playerSkin.player.color,
      glowColor: playerSkin.player.glowColor,
      innerColor: playerSkin.player.innerColor,
      outerColor: playerSkin.player.outerColor,
      shape: playerSkin.player.shape,
      rainbow: playerSkin.player.rainbow,
      trailLength: trailSkin.trail.length,
      trailColor: trailSkin.trail.color,
      trailRainbow: trailSkin.trail.rainbow
    };
  }

  getPickupEffectConfig() {
    const skin = this.getSelectedSkin('effect');
    return skin ? skin.pickupEffect : null;
  }

  reset() {
    this.unlockedSkins = {};
    this.selectedSkinIds = {
      player: DEFAULT_SKIN_ID,
      trail: DEFAULT_SKIN_ID,
      effect: DEFAULT_SKIN_ID
    };
    
    const defaultSkins = this.skins.filter(s => s.unlock.type === 'default');
    defaultSkins.forEach(skin => {
      this.unlockedSkins[skin.id] = { unlockedAt: Date.now() };
    });
    
    this.save();
    this.notifyChange('reset', null, null);
  }
}

export class SkinRenderer {
  static renderPlayer(ctx, player, skin) {
    if (!skin) {
      SkinRenderer.renderDefaultPlayer(ctx, player);
      return;
    }

    const playerSkin = skin.player;
    
    for (let i = player.trail.length - 1; i >= 0; i--) {
      const t = player.trail[i];
      const alpha = (1 - i / player.trail.length) * 0.3;
      const size = player.size * (1 - i / player.trail.length * 0.5);
      
      let trailColor = player.config.trailColor || player.config.color;
      if (player.config.trailRainbow) {
        const hue = (Date.now() * 0.1 + i * 30) % 360;
        trailColor = `hsl(${hue}, 80%, 60%)`;
      }
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = trailColor;
      ctx.beginPath();
      ctx.arc(t.x, t.y, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(player.x, player.y);

    if (player.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    let glowColor = playerSkin.glowColor;
    let bodyColor = playerSkin.color;
    let innerColor = playerSkin.innerColor;
    let outerColor = playerSkin.outerColor;
    
    if (playerSkin.rainbow) {
      const hue = (Date.now() * 0.1) % 360;
      bodyColor = `hsl(${hue}, 70%, 55%)`;
      glowColor = `hsla(${hue}, 70%, 55%, 0.6)`;
      innerColor = `hsl(${hue}, 80%, 85%)`;
      outerColor = `hsl(${hue}, 70%, 35%)`;
    }

    if (player.hitFlash > 0) {
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#ef4444';
    } else {
      ctx.shadowBlur = 25;
      ctx.shadowColor = glowColor;
    }

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, player.size / 2);
    gradient.addColorStop(0, innerColor);
    gradient.addColorStop(0.3, bodyColor);
    gradient.addColorStop(1, outerColor);

    ctx.fillStyle = gradient;
    ctx.beginPath();

    switch (playerSkin.shape) {
      case 'star':
        SkinRenderer.drawStar(ctx, player.size / 2, 5);
        break;
      case 'diamond':
        SkinRenderer.drawDiamond(ctx, player.size / 2);
        break;
      case 'rainbow':
      case 'circle':
      default:
        ctx.arc(0, 0, player.size / 2, 0, Math.PI * 2);
        break;
    }
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(-player.size / 6, -player.size / 6, player.size / 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, player.size / 2 + 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  static renderDefaultPlayer(ctx, player) {
    for (let i = player.trail.length - 1; i >= 0; i--) {
      const t = player.trail[i];
      const alpha = (1 - i / player.trail.length) * 0.3;
      const size = player.size * (1 - i / player.trail.length * 0.5);
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = player.config.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(player.x, player.y);

    if (player.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    if (player.hitFlash > 0) {
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#ef4444';
    } else {
      ctx.shadowBlur = 25;
      ctx.shadowColor = player.config.glowColor;
    }

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, player.size / 2);
    gradient.addColorStop(0, '#c7d2fe');
    gradient.addColorStop(0.3, player.config.color);
    gradient.addColorStop(1, '#4338ca');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, player.size / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(-player.size / 6, -player.size / 6, player.size / 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, player.size / 2 + 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  static drawStar(ctx, radius, points) {
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const r = i % 2 === 0 ? radius : radius * 0.5;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
  }

  static drawDiamond(ctx, radius) {
    ctx.moveTo(0, -radius);
    ctx.lineTo(radius * 0.7, 0);
    ctx.lineTo(0, radius);
    ctx.lineTo(-radius * 0.7, 0);
    ctx.closePath();
  }
}

export class PickupEffect {
  constructor(x, y, effectConfig) {
    this.x = x;
    this.y = y;
    this.config = effectConfig;
    this.particles = [];
    this.active = true;
    this.lifetime = 500;
    this.maxLifetime = 500;
    
    this.initParticles();
  }

  initParticles() {
    const count = this.config.particleCount || 8;
    const type = this.config.type || 'sparkle';
    const baseColor = this.config.color || '#fbbf24';
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      
      let color = baseColor;
      if (this.config.type === 'rainbow') {
        const hue = (i / count) * 360;
        color = `hsl(${hue}, 80%, 60%)`;
      }
      
      this.particles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: color,
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      });
    }
    
    if (type === 'ring') {
      this.ring = {
        radius: 0,
        maxRadius: 40,
        alpha: 0.8
      };
    }
  }

  update(deltaTime) {
    if (!this.active) return;
    
    this.lifetime -= deltaTime;
    
    const progress = 1 - this.lifetime / this.maxLifetime;
    
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.alpha = 1 - progress;
      p.rotation += p.rotationSpeed;
      
      if (this.config.type === 'rainbow') {
        const hue = (Date.now() * 0.5 + p.x) % 360;
        p.color = `hsl(${hue}, 80%, 60%)`;
      }
    });
    
    if (this.ring) {
      this.ring.radius = this.ring.maxRadius * progress;
      this.ring.alpha = 0.8 * (1 - progress);
    }
    
    if (this.lifetime <= 0) {
      this.active = false;
    }
  }

  render(ctx) {
    if (!this.active) return;
    
    if (this.ring) {
      ctx.save();
      ctx.globalAlpha = this.ring.alpha;
      ctx.strokeStyle = this.config.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.ring.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      
      if (this.config.type === 'sparkle' || this.config.type === 'rainbow') {
        SkinRenderer.drawStar(ctx, p.size, 4);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      }
      ctx.fill();
      
      ctx.restore();
    });
  }
}
