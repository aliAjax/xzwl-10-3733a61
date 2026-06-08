import { CONFIG, GAME_STATES, TRAINING_PRESETS } from './config.js';
import { Player } from './player.js';
import { Star, Obstacle } from './entities.js';
import { CollisionDetector } from './collision.js';
import { PickupEffect } from './skins.js';
import { ReplayManager } from './replay.js';

export class Game {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;
    
    this.width = config.game.canvasWidth;
    this.height = config.game.canvasHeight;
    this.bounds = { x: 0, y: 0, width: this.width, height: this.height };
    
    this.state = GAME_STATES.IDLE;
    this.entities = [];
    this.backgroundStars = [];
    this.scoreManager = null;
    this.inputManager = null;
    this.player = null;
    
    this.starSpawnTimer = 0;
    this.obstacleSpawnTimer = 0;
    this.lastTime = 0;
    this.animationId = null;
    
    this.levelSystem = null;
    this.powerUpSystem = null;
    this.enemySystem = null;
    this.achievementSystem = null;
    this.dailyChallengeSystem = null;
    this.statsSystem = null;
    this.audioSystem = null;
    this.settingsManager = null;
    
    this.soundEnabled = true;
    this.speedMultiplier = 1.0;
    
    this.onStateChange = null;
    this.onScoreChange = null;
    this.onLivesChange = null;
    this.onLevelChange = null;
    this.onGameOver = null;
    this.onSettingsChange = null;
    
    this.pickupEffects = [];
    this.skinManager = null;
    
    this.isTrainingMode = false;
    this.trainingConfig = null;
    this.trainingStats = {
      starsCollected: 0,
      obstaclesAvoided: 0,
      powerupsUsed: 0,
      startTime: 0
    };
    
    this.replayManager = new ReplayManager();
    this.isReplayMode = false;
    
    this.initBackgroundStars();
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

  init(scoreManager, inputManager) {
    this.scoreManager = scoreManager;
    this.inputManager = inputManager;
    
    this.scoreManager.onScoreChange((score) => {
      if (this.onScoreChange) this.onScoreChange(score);
    });
    
    this.player = new Player(
      this.width / 2,
      this.height / 2,
      this.config.player,
      this.bounds
    );
    
    this.inputManager.onKeyDown((key) => {
      if (key === 'escape' || key === 'p') {
        if (this.state === GAME_STATES.PLAYING) {
          this.pause();
        } else if (this.state === GAME_STATES.PAUSED) {
          this.resume();
        }
      }
      if (key === ' ' && this.state === GAME_STATES.IDLE) {
        this.start();
      }
    });
  }

  start() {
    if (this.state !== GAME_STATES.IDLE && this.state !== GAME_STATES.GAME_OVER) return;
    
    this.reset();
    this.state = GAME_STATES.PLAYING;
    this.lastTime = performance.now();
    
    if (this.statsSystem) {
      this.statsSystem.startNewSession();
    }
    
    this.replayManager.startRecording(this);
    
    if (this.onStateChange) this.onStateChange(this.state);
    if (this.audioSystem && this.soundEnabled) this.audioSystem.play('start');
    
    this.gameLoop();
  }

  startTraining(presetKey = 'normal') {
    if (this.state !== GAME_STATES.IDLE && this.state !== GAME_STATES.GAME_OVER) return;
    
    const preset = TRAINING_PRESETS[presetKey] || TRAINING_PRESETS.normal;
    this.trainingConfig = { ...preset };
    this.isTrainingMode = true;
    this.trainingStats = {
      starsCollected: 0,
      obstaclesAvoided: 0,
      powerupsUsed: 0,
      startTime: Date.now()
    };
    
    this.reset();
    this.state = GAME_STATES.TRAINING;
    this.lastTime = performance.now();
    
    if (this.powerUpSystem) {
      this.powerUpSystem.config.spawnInterval = this.trainingConfig.powerUpInterval;
      this.powerUpSystem.config.maxCount = this.trainingConfig.maxPowerUps;
    }
    
    if (this.onStateChange) this.onStateChange(this.state);
    if (this.audioSystem && this.soundEnabled) this.audioSystem.play('start');
    
    this.gameLoop();
  }

  changeTrainingPreset(presetKey) {
    if (!this.isTrainingMode) return;
    
    const preset = TRAINING_PRESETS[presetKey];
    if (!preset) return;
    
    this.trainingConfig = { ...preset };
    
    if (this.powerUpSystem) {
      this.powerUpSystem.config.spawnInterval = this.trainingConfig.powerUpInterval;
      this.powerUpSystem.config.maxCount = this.trainingConfig.maxPowerUps;
    }
  }

  exitTraining() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    this.isTrainingMode = false;
    this.trainingConfig = null;
    
    if (this.powerUpSystem) {
      this.powerUpSystem.config.spawnInterval = CONFIG.powerUps.spawnInterval;
      this.powerUpSystem.config.maxCount = CONFIG.powerUps.maxCount;
    }
    
    this.state = GAME_STATES.IDLE;
    if (this.onStateChange) this.onStateChange(this.state);
  }

  pause() {
    if (this.state !== GAME_STATES.PLAYING && this.state !== GAME_STATES.TRAINING) return;
    
    this.state = GAME_STATES.PAUSED;
    if (this.statsSystem && !this.isTrainingMode) {
      this.statsSystem.pauseSession();
    }
    if (this.onStateChange) this.onStateChange(this.state);
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.audioSystem && this.soundEnabled) this.audioSystem.play('pause');
  }

  resume() {
    if (this.state !== GAME_STATES.PAUSED) return;
    
    this.state = this.isTrainingMode ? GAME_STATES.TRAINING : GAME_STATES.PLAYING;
    if (this.statsSystem && !this.isTrainingMode) {
      this.statsSystem.resumeSession();
    }
    this.lastTime = performance.now();
    if (this.onStateChange) this.onStateChange(this.state);
    if (this.audioSystem && this.soundEnabled) this.audioSystem.play('resume');
    
    this.gameLoop();
  }

  restart() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    this.state = GAME_STATES.IDLE;
    if (this.onStateChange) this.onStateChange(this.state);
    this.reset();
    this.start();
  }

  reset() {
    this.entities = [];
    this.pickupEffects = [];
    this.starSpawnTimer = 0;
    this.obstacleSpawnTimer = 0;
    this.scoreManager.reset();
    
    if (this.levelSystem) this.levelSystem.reset();
    if (this.powerUpSystem) this.powerUpSystem.reset();
    
    this.player.reset(
      this.width / 2,
      this.height / 2
    );
    this.player.setLives(this.config.game.initialLives);
    
    if (this.onLivesChange) this.onLivesChange(this.player.getLives());
  }

  gameOver() {
    if (this.isReplayMode) {
      return;
    }
    
    if (this.isTrainingMode) {
      this.exitTraining();
      return;
    }
    
    this.state = GAME_STATES.GAME_OVER;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    const isNewRecord = this.scoreManager.saveHighScore();
    
    if (this.dailyChallengeSystem && !this.isReplayMode) {
      this.dailyChallengeSystem.notify('game_over', this.getLevel());
    }
    
    let sessionStats = null;
    if (this.statsSystem && !this.isReplayMode) {
      sessionStats = this.statsSystem.endSession();
    }
    
    const recording = this.replayManager.stopRecording(this, isNewRecord);
    console.log('🎥 录像已保存，时长:', recording ? Math.round(recording.duration / 1000) + 's' : '无');
    
    if (this.onStateChange) this.onStateChange(this.state);
    if (this.onGameOver) this.onGameOver(this.scoreManager.getScore(), isNewRecord, sessionStats);
    if (this.audioSystem && this.soundEnabled) this.audioSystem.play('gameover');
  }

  gameLoop(currentTime = performance.now()) {
    if (this.state !== GAME_STATES.PLAYING && this.state !== GAME_STATES.TRAINING) return;
    
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render();
    
    this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(deltaTime) {
    const direction = this.inputManager.getDirection();
    
    if (this.state === GAME_STATES.PLAYING) {
      this.replayManager.recordFrame(this, direction);
    }
    
    this.player.move(direction.dx, direction.dy, deltaTime);
    this.player.update(deltaTime);
    
    this.spawnEntities(deltaTime);
    
    this.entities.forEach(entity => {
      if (entity.active) {
        entity.update(deltaTime);
      }
    });
    
    this.entities = this.entities.filter(e => e.active);
    
    this.pickupEffects.forEach(effect => {
      if (effect.active) {
        effect.update(deltaTime);
      }
    });
    this.pickupEffects = this.pickupEffects.filter(e => e.active);
    
    this.checkCollisions();
    
    if (this.powerUpSystem) this.powerUpSystem.update(deltaTime);
    if (this.enemySystem) this.enemySystem.update(deltaTime);
    
    if (!this.isTrainingMode && !this.isReplayMode) {
      if (this.levelSystem) this.levelSystem.update(deltaTime);
      if (this.achievementSystem) this.achievementSystem.check(this);
      
      if (this.skinManager) {
        const gameState = {
          currentScore: this.getScore()
        };
        const newlyUnlocked = this.skinManager.checkUnlocks(
          gameState,
          this.achievementSystem,
          this.scoreManager
        );
        
        newlyUnlocked.forEach(skin => {
          if (this.onSkinUnlock) {
            this.onSkinUnlock(skin);
          }
        });
      }
    }
  }

  spawnEntities(deltaTime) {
    let starInterval, maxStars, obstacleInterval, maxObstacles;
    
    if (this.isTrainingMode && this.trainingConfig) {
      starInterval = this.trainingConfig.starInterval;
      maxStars = this.trainingConfig.maxStars;
      obstacleInterval = this.trainingConfig.obstacleInterval;
      maxObstacles = this.trainingConfig.maxObstacles;
    } else {
      starInterval = this.levelSystem 
        ? this.levelSystem.getSpawnInterval('star') 
        : this.config.star.spawnInterval;
      maxStars = this.levelSystem 
        ? this.levelSystem.getMaxCount('star') 
        : this.config.star.maxCount;
      obstacleInterval = this.levelSystem 
        ? this.levelSystem.getSpawnInterval('obstacle') 
        : this.config.obstacle.spawnInterval;
      maxObstacles = this.levelSystem 
        ? this.levelSystem.getMaxCount('obstacle') 
        : this.config.obstacle.maxCount;
    }
    
    this.starSpawnTimer += deltaTime;
    if (this.starSpawnTimer >= starInterval) {
      this.starSpawnTimer = 0;
      const starCount = this.entities.filter(e => e.type === 'star').length;
      
      if (starCount < maxStars) {
        this.spawnStar();
      }
    }
    
    this.obstacleSpawnTimer += deltaTime;
    if (this.obstacleSpawnTimer >= obstacleInterval) {
      this.obstacleSpawnTimer = 0;
      const obstacleCount = this.entities.filter(e => e.type === 'obstacle').length;
      
      if (obstacleCount < maxObstacles) {
        this.spawnObstacle();
      }
    }
    
    if (this.powerUpSystem) {
      this.powerUpSystem.trySpawn(deltaTime, this.entities);
    }
    
    if (this.enemySystem) {
      this.enemySystem.trySpawn(deltaTime, this.entities);
    }
  }

  spawnStar() {
    const padding = 50;
    const x = padding + Math.random() * (this.width - padding * 2);
    const y = padding + Math.random() * (this.height - padding * 2);
    
    const star = new Star(x, y, this.config.star);
    
    if (this.powerUpSystem) {
      this.powerUpSystem.modifyEntity(star);
    }
    
    if (this.state === GAME_STATES.PLAYING) {
      this.replayManager.recordEntitySpawn('star', {
        x: x,
        y: y,
        config: this.config.star
      });
    }
    
    this.entities.push(star);
  }

  spawnObstacle() {
    const padding = 50;
    const x = padding + Math.random() * (this.width - padding * 2);
    const y = padding + Math.random() * (this.height - padding * 2);
    
    const obstacleConfig = { ...this.config.obstacle };
    if (this.isTrainingMode && this.trainingConfig) {
      obstacleConfig.speed = this.trainingConfig.obstacleSpeed;
    } else if (this.levelSystem) {
      obstacleConfig.speed = this.levelSystem.getObstacleSpeed();
    }
    
    const obstacle = new Obstacle(x, y, obstacleConfig, this.bounds);
    
    if (this.enemySystem) {
      this.enemySystem.modifyEntity(obstacle);
    }
    
    if (this.state === GAME_STATES.PLAYING) {
      this.replayManager.recordEntitySpawn('obstacle', {
        x: x,
        y: y,
        vx: obstacle.vx,
        vy: obstacle.vy,
        vertices: obstacle.vertices,
        config: obstacleConfig
      });
    }
    
    this.entities.push(obstacle);
  }

  checkCollisions() {
    const playerBounds = this.player.getBounds();
    
    for (const entity of this.entities) {
      if (!entity.active) continue;
      if (entity.type === 'powerup') continue;
      if (entity.type === 'enemy') continue;
      
      const entityBounds = entity.getBounds();
      if (CollisionDetector.checkCircle(playerBounds, entityBounds)) {
        const result = entity.onCollide(this.player);
        if (result) {
          this.handleCollisionResult(result, entity);
        }
      }
    }
    
    if (this.powerUpSystem) {
      this.powerUpSystem.checkCollisions(this.player, this.entities);
    }
    
    if (this.enemySystem) {
      this.enemySystem.checkCollisions(this.player, this.entities);
    }
  }

  handleCollisionResult(result, entity) {
    if (this.state === GAME_STATES.PLAYING && entity) {
      this.replayManager.recordCollision(result.type, {
        entityType: entity.type,
        x: entity.x,
        y: entity.y,
        value: result.value
      });
    }

    switch (result.type) {
      case 'score':
        this.scoreManager.addScore(result.value);
        
        if (entity) {
          const effectConfig = this.skinManager 
            ? this.skinManager.getPickupEffectConfig() 
            : null;
          
          if (effectConfig) {
            const effect = new PickupEffect(entity.x, entity.y, effectConfig);
            this.pickupEffects.push(effect);
          }
        }
        
        if (this.audioSystem && this.soundEnabled) this.audioSystem.play('collect');
        
        if (this.isTrainingMode) {
          this.trainingStats.starsCollected += 1;
        } else if (!this.isReplayMode) {
          if (this.achievementSystem) {
            this.achievementSystem.notify('star_collected', result.value);
          }
          if (this.dailyChallengeSystem) {
            this.dailyChallengeSystem.notify('star_collected', result.value / this.config.star.points);
            this.dailyChallengeSystem.notify('score', this.getScore());
          }
          if (this.statsSystem) {
            this.statsSystem.notify('star_collected', result.value / this.config.star.points);
          }
        }
        break;
        
      case 'damage':
        if (this.player.takeDamage(result.value)) {
          if (this.onLivesChange) this.onLivesChange(this.player.getLives());
          if (this.audioSystem && this.soundEnabled) this.audioSystem.play('hit');
          
          if (!this.isTrainingMode && !this.isReplayMode) {
            if (this.achievementSystem) {
              this.achievementSystem.notify('damage_taken', result.value);
            }
            if (this.dailyChallengeSystem) {
              this.dailyChallengeSystem.notify('damage_taken', result.value);
            }
            if (this.statsSystem) {
              this.statsSystem.notify('collision', result.value);
            }
          }
          
          if (this.player.getLives() <= 0) {
            this.gameOver();
          }
        }
        break;
        
      case 'heal':
        this.player.heal(result.value);
        if (this.onLivesChange) this.onLivesChange(this.player.getLives());
        if (this.audioSystem && this.soundEnabled) this.audioSystem.play('heal');
        
        if (!this.isTrainingMode && !this.isReplayMode && this.dailyChallengeSystem) {
          this.dailyChallengeSystem.notify('heal_used', result.value);
        }
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
      if (effect.active) {
        effect.render(this.ctx);
      }
    });
    
    if (this.powerUpSystem) {
      this.powerUpSystem.renderEffects(this.ctx);
    }
    
    const currentSkin = this.skinManager ? this.skinManager.getCurrentSkin() : null;
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

  renderIdle() {
    this.renderBackground();
    
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.font = 'bold 48px Orbitron, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('✨', this.width / 2, this.height / 2 - 20);
    this.ctx.font = '20px Noto Sans SC, sans-serif';
    this.ctx.fillText('点击开始按钮开始游戏', this.width / 2, this.height / 2 + 30);
    this.ctx.restore();
  }

  getState() {
    return this.state;
  }

  isTraining() {
    return this.isTrainingMode;
  }

  getTrainingStats() {
    const duration = Date.now() - this.trainingStats.startTime;
    return {
      ...this.trainingStats,
      duration: duration
    };
  }

  getTrainingConfig() {
    return this.trainingConfig;
  }

  getScore() {
    return this.scoreManager ? this.scoreManager.getScore() : 0;
  }

  getHighScore() {
    return this.scoreManager ? this.scoreManager.getHighScore() : 0;
  }

  getLives() {
    return this.player ? this.player.getLives() : 0;
  }

  getLevel() {
    return this.levelSystem ? this.levelSystem.getLevel() : 1;
  }

  registerLevelSystem(system) {
    this.levelSystem = system;
    if (system) {
      system.onLevelChange = (level) => {
        if (this.onLevelChange) {
          this.onLevelChange(level);
        }
        if (this.dailyChallengeSystem) {
          this.dailyChallengeSystem.notify('level_up', level);
        }
        if (this.statsSystem) {
          this.statsSystem.updateSessionLevel(level);
        }
      };
      if (system.onRegister) {
        system.onRegister(this);
      }
    }
  }

  registerPowerUpSystem(system) {
    this.powerUpSystem = system;
    if (system && system.onRegister) {
      system.onRegister(this);
    }
  }

  registerEnemySystem(system) {
    this.enemySystem = system;
    if (system && system.onRegister) {
      system.onRegister(this);
    }
  }

  registerAchievementSystem(system) {
    this.achievementSystem = system;
    if (system && system.onRegister) {
      system.onRegister(this);
    }
  }

  registerDailyChallengeSystem(system) {
    this.dailyChallengeSystem = system;
    if (system && system.onRegister) {
      system.onRegister(this);
    }
  }

  registerStatsSystem(system) {
    this.statsSystem = system;
    if (system && system.onRegister) {
      system.onRegister(this);
    }
  }

  registerAudioSystem(system) {
    this.audioSystem = system;
    if (system && system.onRegister) {
      system.onRegister(this);
    }
  }

  registerSettingsManager(system) {
    this.settingsManager = system;
    if (system) {
      this.soundEnabled = system.get('soundEnabled');
      this.speedMultiplier = system.getSpeedMultiplier();
      
      if (this.player) {
        this.player.setSettingsSpeedMultiplier(this.speedMultiplier);
      }
      
      system.onChange((key, newValue, oldValue) => {
        this.handleSettingsChange(key, newValue, oldValue);
      });
      
      if (system.onRegister) {
        system.onRegister(this);
      }
    }
  }

  handleSettingsChange(key, newValue, oldValue) {
    switch (key) {
      case 'soundEnabled':
        this.soundEnabled = newValue;
        break;
      case 'speedLevel':
        this.speedMultiplier = this.settingsManager.getSpeedMultiplier();
        if (this.player) {
          this.player.setSettingsSpeedMultiplier(this.speedMultiplier);
        }
        break;
    }
    
    if (this.onSettingsChange) {
      this.onSettingsChange(key, newValue, oldValue);
    }
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }

  setSpeedMultiplier(multiplier) {
    this.speedMultiplier = multiplier;
    if (this.player) {
      this.player.setSettingsSpeedMultiplier(multiplier);
    }
  }

  registerSkinManager(system) {
    this.skinManager = system;
    if (system) {
      if (this.player) {
        system.applySkinToPlayer(this.player);
      }
      
      system.onChange((type, newValue, oldValue) => {
        if (type === 'select' && this.player) {
          system.applySkinToPlayer(this.player);
        }
      });
      
      if (system.onRegister) {
        system.onRegister(this);
      }
    }
  }
}
