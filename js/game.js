import { CONFIG, GAME_STATES } from './config.js';
import { Player } from './player.js';
import { Star, Obstacle } from './entities.js';
import { CollisionDetector } from './collision.js';

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
    
    if (this.onStateChange) this.onStateChange(this.state);
    if (this.audioSystem && this.soundEnabled) this.audioSystem.play('start');
    
    this.gameLoop();
  }

  pause() {
    if (this.state !== GAME_STATES.PLAYING) return;
    
    this.state = GAME_STATES.PAUSED;
    if (this.onStateChange) this.onStateChange(this.state);
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.audioSystem && this.soundEnabled) this.audioSystem.play('pause');
  }

  resume() {
    if (this.state !== GAME_STATES.PAUSED) return;
    
    this.state = GAME_STATES.PLAYING;
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
    this.reset();
    this.start();
  }

  reset() {
    this.entities = [];
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
    this.state = GAME_STATES.GAME_OVER;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    const isNewRecord = this.scoreManager.saveHighScore();
    
    if (this.onStateChange) this.onStateChange(this.state);
    if (this.onGameOver) this.onGameOver(this.scoreManager.getScore(), isNewRecord);
    if (this.audioSystem && this.soundEnabled) this.audioSystem.play('gameover');
  }

  gameLoop(currentTime = performance.now()) {
    if (this.state !== GAME_STATES.PLAYING) return;
    
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render();
    
    this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(deltaTime) {
    const direction = this.inputManager.getDirection();
    this.player.move(direction.dx, direction.dy, deltaTime);
    this.player.update(deltaTime);
    
    this.spawnEntities(deltaTime);
    
    this.entities.forEach(entity => {
      if (entity.active) {
        entity.update(deltaTime);
      }
    });
    
    this.entities = this.entities.filter(e => e.active);
    
    this.checkCollisions();
    
    if (this.levelSystem) this.levelSystem.update(deltaTime);
    if (this.powerUpSystem) this.powerUpSystem.update(deltaTime);
    if (this.enemySystem) this.enemySystem.update(deltaTime);
    if (this.achievementSystem) this.achievementSystem.check(this);
  }

  spawnEntities(deltaTime) {
    this.starSpawnTimer += deltaTime;
    const starInterval = this.levelSystem 
      ? this.levelSystem.getSpawnInterval('star') 
      : this.config.star.spawnInterval;
    
    if (this.starSpawnTimer >= starInterval) {
      this.starSpawnTimer = 0;
      const starCount = this.entities.filter(e => e.type === 'star').length;
      const maxStars = this.levelSystem 
        ? this.levelSystem.getMaxCount('star') 
        : this.config.star.maxCount;
      
      if (starCount < maxStars) {
        this.spawnStar();
      }
    }
    
    this.obstacleSpawnTimer += deltaTime;
    const obstacleInterval = this.levelSystem 
      ? this.levelSystem.getSpawnInterval('obstacle') 
      : this.config.obstacle.spawnInterval;
    
    if (this.obstacleSpawnTimer >= obstacleInterval) {
      this.obstacleSpawnTimer = 0;
      const obstacleCount = this.entities.filter(e => e.type === 'obstacle').length;
      const maxObstacles = this.levelSystem 
        ? this.levelSystem.getMaxCount('obstacle') 
        : this.config.obstacle.maxCount;
      
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
    
    this.entities.push(star);
  }

  spawnObstacle() {
    const padding = 50;
    const x = padding + Math.random() * (this.width - padding * 2);
    const y = padding + Math.random() * (this.height - padding * 2);
    
    const obstacleConfig = { ...this.config.obstacle };
    if (this.levelSystem) {
      obstacleConfig.speed = this.levelSystem.getObstacleSpeed();
    }
    
    const obstacle = new Obstacle(x, y, obstacleConfig, this.bounds);
    
    if (this.enemySystem) {
      this.enemySystem.modifyEntity(obstacle);
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
          this.handleCollisionResult(result);
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

  handleCollisionResult(result) {
    switch (result.type) {
      case 'score':
        this.scoreManager.addScore(result.value);
        if (this.audioSystem && this.soundEnabled) this.audioSystem.play('collect');
        if (this.achievementSystem) {
          this.achievementSystem.notify('star_collected', result.value);
        }
        break;
        
      case 'damage':
        if (this.player.takeDamage(result.value)) {
          if (this.onLivesChange) this.onLivesChange(this.player.getLives());
          if (this.audioSystem && this.soundEnabled) this.audioSystem.play('hit');
          if (this.achievementSystem) {
            this.achievementSystem.notify('damage_taken', result.value);
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
    
    if (this.powerUpSystem) {
      this.powerUpSystem.renderEffects(this.ctx);
    }
    
    this.player.render(this.ctx);
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
}
