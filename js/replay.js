import { CONFIG, GAME_STATES } from './config.js';
import { Player } from './player.js';
import { Star, Obstacle, PowerUp } from './entities.js';

export const REPLAY_STATES = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  FINISHED: 'finished'
};

export class ReplayRecorder {
  constructor() {
    this.currentRecording = null;
    this.isRecording = false;
    this.frameInterval = 16;
    this.lastFrameTime = 0;
    this.frameCount = 0;
  }

  startRecording(initialState) {
    this.currentRecording = {
      version: 1,
      startTime: performance.now(),
      duration: 0,
      finalScore: 0,
      finalLevel: 1,
      finalLives: 0,
      isNewRecord: false,
      initialState: JSON.parse(JSON.stringify(initialState)),
      inputFrames: [],
      entityEvents: [],
      collisionEvents: [],
      stateSnapshots: []
    };
    this.isRecording = true;
    this.lastFrameTime = 0;
    this.frameCount = 0;
  }

  recordFrame(currentTime, input, gameState) {
    if (!this.isRecording || !this.currentRecording) return;

    const elapsed = currentTime - this.currentRecording.startTime;

    if (elapsed - this.lastFrameTime >= this.frameInterval) {
      this.currentRecording.inputFrames.push({
        t: elapsed,
        dx: input.dx,
        dy: input.dy
      });
      this.lastFrameTime = elapsed;
      this.frameCount++;
    }

    if (this.frameCount % 30 === 0) {
      this.recordStateSnapshot(elapsed, gameState);
    }
  }

  recordEntitySpawn(entityType, entityData) {
    if (!this.isRecording || !this.currentRecording) return;

    const elapsed = performance.now() - this.currentRecording.startTime;
    this.currentRecording.entityEvents.push({
      t: elapsed,
      type: 'spawn',
      entityType: entityType,
      data: JSON.parse(JSON.stringify(entityData))
    });
  }

  recordCollision(collisionType, collisionData) {
    if (!this.isRecording || !this.currentRecording) return;

    const elapsed = performance.now() - this.currentRecording.startTime;
    this.currentRecording.collisionEvents.push({
      t: elapsed,
      type: collisionType,
      data: JSON.parse(JSON.stringify(collisionData))
    });
  }

  recordStateSnapshot(elapsed, gameState) {
    if (!this.isRecording || !this.currentRecording) return;

    this.currentRecording.stateSnapshots.push({
      t: elapsed,
      score: gameState.score,
      lives: gameState.lives,
      level: gameState.level
    });
  }

  stopRecording(finalData) {
    if (!this.isRecording || !this.currentRecording) return null;

    this.currentRecording.duration = performance.now() - this.currentRecording.startTime;
    this.currentRecording.finalScore = finalData.score;
    this.currentRecording.finalLevel = finalData.level;
    this.currentRecording.finalLives = finalData.lives;
    this.currentRecording.isNewRecord = finalData.isNewRecord || false;

    this.recordStateSnapshot(this.currentRecording.duration, {
      score: finalData.score,
      lives: finalData.lives,
      level: finalData.level
    });

    this.isRecording = false;
    const recording = this.currentRecording;
    return recording;
  }

  getCurrentRecording() {
    return this.currentRecording;
  }

  isRecordingActive() {
    return this.isRecording;
  }
}

export class ReplayPlayer {
  constructor(canvas, game, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.game = game;
    this.config = config;
    this.width = config.game.canvasWidth;
    this.height = config.game.canvasHeight;
    this.bounds = { x: 0, y: 0, width: this.width, height: this.height };

    this.recording = null;
    this.state = REPLAY_STATES.IDLE;
    this.currentTime = 0;
    this.playbackSpeed = 1;
    this.animationId = null;
    this.lastFrameTime = 0;

    this.player = null;
    this.entities = [];
    this.pickupEffects = [];
    this.powerUpEffects = [];

    this.inputFrameIndex = 0;
    this.entityEventIndex = 0;
    this.collisionEventIndex = 0;
    this.currentInput = { dx: 0, dy: 0 };

    this.backgroundStars = [];
    this.initBackgroundStars();

    this.onStateChange = null;
    this.onProgressChange = null;
  }

  initBackgroundStars() {
    for (let i = 0; i < this.config.game.backgroundStars; i++) {
      this.backgroundStars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 0.5,
        brightness: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.01
      });
    }
  }

  loadRecording(recording) {
    this.recording = recording;
    this.reset();
  }

  reset() {
    if (!this.recording) return;

    this.currentTime = 0;
    this.inputFrameIndex = 0;
    this.entityEventIndex = 0;
    this.collisionEventIndex = 0;
    this.currentInput = { dx: 0, dy: 0 };
    this.entities = [];
    this.pickupEffects = [];
    this.powerUpEffects = [];

    const init = this.recording.initialState;
    this.player = new Player(
      init.player.x,
      init.player.y,
      this.config.player,
      this.bounds
    );
    this.player.setLives(init.player.lives);

    if (this.game.skinManager) {
      this.game.skinManager.applySkinToPlayer(this.player);
    }

    this.state = REPLAY_STATES.IDLE;
    this.notifyStateChange();
    this.notifyProgressChange();
  }

  play() {
    if (!this.recording) return;
    if (this.state === REPLAY_STATES.PLAYING) return;
    if (this.state === REPLAY_STATES.FINISHED) {
      this.reset();
    }

    this.state = REPLAY_STATES.PLAYING;
    this.lastFrameTime = performance.now();
    this.notifyStateChange();
    this.playbackLoop();
  }

  pause() {
    if (this.state !== REPLAY_STATES.PLAYING) return;

    this.state = REPLAY_STATES.PAUSED;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.notifyStateChange();
  }

  togglePlayPause() {
    if (this.state === REPLAY_STATES.PLAYING) {
      this.pause();
    } else {
      this.play();
    }
  }

  replay() {
    this.reset();
    this.play();
  }

  seekTo(time) {
    if (!this.recording) return;

    const targetTime = Math.max(0, Math.min(time, this.recording.duration));
    
    this.reset();
    this.currentTime = 0;
    this.inputFrameIndex = 0;
    this.entityEventIndex = 0;
    this.collisionEventIndex = 0;

    const stepSize = 16;
    while (this.currentTime < targetTime) {
      this.simulateStep(Math.min(stepSize, targetTime - this.currentTime));
    }

    this.render();
    this.notifyProgressChange();
  }

  playbackLoop() {
    if (this.state !== REPLAY_STATES.PLAYING) return;

    const now = performance.now();
    const deltaTime = (now - this.lastFrameTime) * this.playbackSpeed;
    this.lastFrameTime = now;

    if (this.currentTime + deltaTime >= this.recording.duration) {
      this.currentTime = this.recording.duration;
      this.simulateStep(this.recording.duration - this.currentTime);
      this.render();
      this.finish();
      return;
    }

    this.simulateStep(deltaTime);
    this.render();
    this.notifyProgressChange();

    this.animationId = requestAnimationFrame(() => this.playbackLoop());
  }

  simulateStep(deltaTime) {
    this.currentTime += deltaTime;

    this.processInputFrames();
    this.processEntityEvents();
    this.processCollisionEvents();
    
    this.player.move(this.currentInput.dx, this.currentInput.dy, deltaTime);
    this.player.update(deltaTime);

    this.entities.forEach(entity => {
      if (entity.active) {
        entity.update(deltaTime);
      }
    });
    this.entities = this.entities.filter(e => e.active);

    this.pickupEffects = this.pickupEffects.filter(e => {
      if (e.update) e.update(deltaTime);
      e.lifetime -= deltaTime;
      return e.lifetime > 0;
    });

    this.powerUpEffects = this.powerUpEffects.filter(effect => {
      effect.remaining -= deltaTime;
      if (effect.remaining <= 0) {
        this.removePowerUpEffect(effect);
        return false;
      }
      return true;
    });
  }

  processInputFrames() {
    while (
      this.inputFrameIndex < this.recording.inputFrames.length &&
      this.recording.inputFrames[this.inputFrameIndex].t <= this.currentTime
    ) {
      const frame = this.recording.inputFrames[this.inputFrameIndex];
      this.currentInput = { dx: frame.dx, dy: frame.dy };
      this.inputFrameIndex++;
    }
  }

  processEntityEvents() {
    while (
      this.entityEventIndex < this.recording.entityEvents.length &&
      this.recording.entityEvents[this.entityEventIndex].t <= this.currentTime
    ) {
      const event = this.recording.entityEvents[this.entityEventIndex];
      if (event.type === 'spawn') {
        this.spawnEntity(event.entityType, event.data);
      }
      this.entityEventIndex++;
    }
  }

  processCollisionEvents() {
    while (
      this.collisionEventIndex < this.recording.collisionEvents.length &&
      this.recording.collisionEvents[this.collisionEventIndex].t <= this.currentTime
    ) {
      const event = this.recording.collisionEvents[this.collisionEventIndex];
      this.handleReplayCollision(event.type, event.data);
      this.collisionEventIndex++;
    }
  }

  spawnEntity(entityType, data) {
    let entity;
    switch (entityType) {
      case 'star':
        entity = new Star(data.x, data.y, { ...this.config.star, ...data.config });
        break;
      case 'obstacle':
        entity = new Obstacle(data.x, data.y, { ...this.config.obstacle, ...data.config }, this.bounds);
        if (data.vx !== undefined && data.vy !== undefined) {
          entity.vx = data.vx;
          entity.vy = data.vy;
        }
        if (data.vertices) {
          entity.vertices = data.vertices;
        }
        break;
      case 'powerup':
        entity = new PowerUp(data.x, data.y, data.powerUpType, { ...data.config, lifetime: this.config.powerUps.lifetime });
        break;
      default:
        return;
    }
    this.entities.push(entity);
  }

  checkCollisions() {
    const playerBounds = this.player.getBounds();

    for (const entity of this.entities) {
      if (!entity.active) continue;

      const entityBounds = entity.getBounds();
      const dx = playerBounds.x - entityBounds.x;
      const dy = playerBounds.y - entityBounds.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDist = (playerBounds.size + entityBounds.size) / 2;

      if (distance < minDist) {
        const result = entity.onCollide(this.player);
        if (result) {
          this.handleReplayCollision(result, entity);
        }
      }
    }
  }

  handleReplayCollision(typeOrResult, dataOrEntity) {
    let type, data, entity;
    
    if (typeof typeOrResult === 'string') {
      type = typeOrResult;
      data = dataOrEntity;
      entity = null;
    } else {
      type = typeOrResult.type;
      data = typeOrResult;
      entity = dataOrEntity;
    }
    
    const x = entity ? entity.x : (data ? data.x : 0);
    const y = entity ? entity.y : (data ? data.y : 0);
    const value = data ? data.value : 0;
    
    switch (type) {
      case 'score':
        const effectConfig = this.game.skinManager 
          ? this.game.skinManager.getPickupEffectConfig() 
          : null;
        if (effectConfig) {
          this.pickupEffects.push({
            x: x,
            y: y,
            update: function(dt) {
              this.lifetime -= dt;
            },
            render: function(ctx) {
              const alpha = Math.max(0, this.lifetime / 300);
              ctx.save();
              ctx.globalAlpha = alpha;
              ctx.fillStyle = effectConfig.color;
              ctx.shadowBlur = 15;
              ctx.shadowColor = effectConfig.color;
              ctx.beginPath();
              ctx.arc(this.x, this.y, 15 * alpha, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            },
            lifetime: 300,
            active: true
          });
        }
        break;
      case 'damage':
        this.player.takeDamage(value);
        break;
      case 'powerup':
        this.applyPowerUp(data.powerUpType, data.config);
        break;
      case 'heal':
        this.player.heal(value);
        break;
    }
    
    if (entity) {
      entity.active = false;
    } else {
      const targetEntity = this.entities.find(e => 
        e.x === x && e.y === y && e.active
      );
      if (targetEntity) {
        targetEntity.active = false;
      }
    }
  }

  applyPowerUp(type, config) {
    switch (type) {
      case 'shield':
        const existingShield = this.powerUpEffects.find(e => e.type === 'shield');
        if (existingShield) {
          existingShield.remaining = config.duration;
        } else {
          this.player.setShield(true);
          this.powerUpEffects.push({
            type: 'shield',
            config: config,
            remaining: config.duration,
            player: this.player
          });
        }
        break;
      case 'speed':
        const existingSpeed = this.powerUpEffects.find(e => e.type === 'speed');
        if (existingSpeed) {
          existingSpeed.remaining = config.duration;
        } else {
          this.player.setSpeedMultiplier(config.multiplier);
          this.powerUpEffects.push({
            type: 'speed',
            config: config,
            remaining: config.duration,
            player: this.player
          });
        }
        break;
      case 'heal':
        this.player.heal(config.healAmount);
        break;
    }
  }

  removePowerUpEffect(effect) {
    switch (effect.type) {
      case 'shield':
        this.player.setShield(false);
        break;
      case 'speed':
        this.player.setSpeedMultiplier(1);
        break;
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.renderBackground();

    this.entities.forEach(entity => {
      if (entity.active) {
        entity.render(this.ctx);
      }
    });

    this.pickupEffects.forEach(effect => {
      if (effect.render) {
        effect.render(this.ctx);
      }
    });

    this.powerUpEffects.forEach(effect => {
      this.renderPowerUpEffect(this.ctx, effect);
    });

    const currentSkin = this.game.skinManager ? this.game.skinManager.getCurrentSkin() : null;
    this.player.render(this.ctx, currentSkin);
  }

  renderBackground() {
    const time = Date.now() * 0.001;

    this.backgroundStars.forEach(star => {
      const brightness = 0.3 + Math.sin(time * star.twinkleSpeed * 10 + star.x) * 0.3 + star.brightness * 0.4;

      this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    const gradient = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, this.width / 2
    );
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.05)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  renderPowerUpEffect(ctx, effect) {
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

  finish() {
    this.state = REPLAY_STATES.FINISHED;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.notifyStateChange();
    this.notifyProgressChange();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.state = REPLAY_STATES.IDLE;
    this.notifyStateChange();
  }

  getProgress() {
    if (!this.recording || this.recording.duration === 0) return 0;
    return this.currentTime / this.recording.duration;
  }

  getCurrentTime() {
    return this.currentTime;
  }

  getDuration() {
    return this.recording ? this.recording.duration : 0;
  }

  getState() {
    return this.state;
  }

  getCurrentScore() {
    if (!this.recording) return 0;
    
    let score = 0;
    for (const snapshot of this.recording.stateSnapshots) {
      if (snapshot.t <= this.currentTime) {
        score = snapshot.score;
      } else {
        break;
      }
    }
    return score;
  }

  getCurrentLives() {
    if (!this.recording) return 0;
    
    let lives = this.recording.initialState.player.lives;
    for (const snapshot of this.recording.stateSnapshots) {
      if (snapshot.t <= this.currentTime) {
        lives = snapshot.lives;
      } else {
        break;
      }
    }
    return lives;
  }

  getCurrentLevel() {
    if (!this.recording) return 1;
    
    let level = 1;
    for (const snapshot of this.recording.stateSnapshots) {
      if (snapshot.t <= this.currentTime) {
        level = snapshot.level;
      } else {
        break;
      }
    }
    return level;
  }

  notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }

  notifyProgressChange() {
    if (this.onProgressChange) {
      this.onProgressChange(this.getProgress(), this.currentTime, this.recording ? this.recording.duration : 0);
    }
  }

  setPlaybackSpeed(speed) {
    this.playbackSpeed = Math.max(0.25, Math.min(4, speed));
  }

  getPlaybackSpeed() {
    return this.playbackSpeed;
  }

  hasRecording() {
    return this.recording !== null;
  }
}

export class ReplayManager {
  constructor() {
    this.recorder = new ReplayRecorder();
    this.lastRecording = null;
    this.replayPlayer = null;
    this.isReplayMode = false;
  }

  startRecording(game) {
    if (this.isReplayMode) return;
    if (!game || !game.player) return;

    const initialState = {
      player: {
        x: game.player.x,
        y: game.player.y,
        lives: game.player.getLives()
      },
      level: game.getLevel(),
      score: game.getScore()
    };

    this.recorder.startRecording(initialState);
  }

  recordFrame(game, input) {
    if (!this.recorder.isRecordingActive()) return;

    const currentTime = performance.now();
    const gameState = {
      score: game.getScore(),
      lives: game.getLives(),
      level: game.getLevel()
    };

    this.recorder.recordFrame(currentTime, input, gameState);
  }

  recordEntitySpawn(entityType, entityData) {
    if (!this.recorder.isRecordingActive()) return;
    this.recorder.recordEntitySpawn(entityType, entityData);
  }

  recordCollision(collisionType, collisionData) {
    if (!this.recorder.isRecordingActive()) return;
    this.recorder.recordCollision(collisionType, collisionData);
  }

  isRecording() {
    return this.recorder.isRecordingActive();
  }

  stopRecording(game, isNewRecord) {
    if (!this.recorder.isRecordingActive()) return null;

    const finalData = {
      score: game.getScore(),
      level: game.getLevel(),
      lives: game.getLives(),
      isNewRecord: isNewRecord
    };

    const recording = this.recorder.stopRecording(finalData);
    if (recording) {
      this.lastRecording = recording;
    }
    return recording;
  }

  hasLastRecording() {
    return this.lastRecording !== null;
  }

  getLastRecording() {
    return this.lastRecording;
  }

  startReplay(canvas, game) {
    if (!this.lastRecording) return null;

    this.isReplayMode = true;
    this.replayPlayer = new ReplayPlayer(canvas, game, game.config);
    this.replayPlayer.loadRecording(this.lastRecording);
    return this.replayPlayer;
  }

  stopReplay() {
    if (this.replayPlayer) {
      this.replayPlayer.stop();
      this.replayPlayer = null;
    }
    this.isReplayMode = false;
  }

  isInReplayMode() {
    return this.isReplayMode;
  }

  getReplayPlayer() {
    return this.replayPlayer;
  }
}
