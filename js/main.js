import { CONFIG, GAME_STATES } from './config.js';
import { Game } from './game.js';
import { InputManager } from './input.js';
import { StorageManager } from './storage.js';
import { ScoreManager } from './score.js';
import { LevelSystem } from './levels.js';
import { PowerUpSystem } from './powerups.js';
import { AchievementSystem } from './achievements.js';
import { SettingsManager, DEFAULT_SETTINGS } from './settings.js';

const UI = {
  canvas: document.getElementById('gameCanvas'),
  scoreEl: document.getElementById('score'),
  highScoreEl: document.getElementById('highScore'),
  livesEl: document.getElementById('lives'),
  levelEl: document.getElementById('level'),
  startOverlay: document.getElementById('startOverlay'),
  pauseOverlay: document.getElementById('pauseOverlay'),
  gameOverOverlay: document.getElementById('gameOverOverlay'),
  finalScoreEl: document.getElementById('finalScore'),
  finalHighScoreEl: document.getElementById('finalHighScore'),
  newRecordEl: document.getElementById('newRecord'),
  startBtn: document.getElementById('startBtn'),
  pauseBtn: document.getElementById('pauseBtn'),
  resumeBtn: document.getElementById('resumeBtn'),
  restartBtn: document.getElementById('restartBtn'),
  restartBtn2: document.getElementById('restartBtn2'),
  restartFromPauseBtn: document.getElementById('restartFromPauseBtn'),
  touchControls: document.getElementById('touchControls'),
  settingsBtn: document.getElementById('settingsBtn'),
  settingsOverlay: document.getElementById('settingsOverlay'),
  settingsCloseBtn: document.getElementById('settingsCloseBtn'),
  settingsResetBtn: document.getElementById('settingsResetBtn'),
  soundToggle: document.getElementById('soundToggle'),
  speedBtns: document.querySelectorAll('.speed-btn'),
  touchModeBtns: document.querySelectorAll('.touch-mode-btn'),
  achievementsBtn: document.getElementById('achievementsBtn'),
  achievementsOverlay: document.getElementById('achievementsOverlay'),
  achievementsCloseBtn: document.getElementById('achievementsCloseBtn'),
  achievementsContent: document.getElementById('achievementsContent'),
  achievementsProgress: document.getElementById('achievementsProgress'),
  achievementToastContainer: document.getElementById('achievementToastContainer')
};

const storage = new StorageManager();
const scoreManager = new ScoreManager(storage);
const inputManager = new InputManager();
const settingsManager = new SettingsManager(storage);
const achievementSystem = new AchievementSystem(storage);
const levelSystem = new LevelSystem(CONFIG.levels);
const powerUpSystem = new PowerUpSystem(CONFIG.powerUps);
const game = new Game(UI.canvas, CONFIG);

inputManager.setTouchControlsElement(UI.touchControls);
game.init(scoreManager, inputManager);
game.registerSettingsManager(settingsManager);

function updateScoreUI(score) {
  UI.scoreEl.textContent = score;
}

function updateLivesUI(lives) {
  const hearts = '❤️'.repeat(Math.max(0, lives));
  const empty = '🖤'.repeat(Math.max(0, CONFIG.game.initialLives - lives));
  UI.livesEl.textContent = hearts + empty;
}

function updateHighScoreUI() {
  UI.highScoreEl.textContent = scoreManager.getHighScore();
}

function updateLevelUI(level) {
  UI.levelEl.textContent = level;
}

function hideAllOverlays() {
  UI.startOverlay.classList.add('hidden');
  UI.pauseOverlay.classList.add('hidden');
  UI.gameOverOverlay.classList.add('hidden');
}

let previousState = GAME_STATES.IDLE;

function handleStateChange(state) {
  hideAllOverlays();
  
  switch (state) {
    case GAME_STATES.IDLE:
      UI.startOverlay.classList.remove('hidden');
      UI.pauseBtn.disabled = true;
      UI.restartBtn2.disabled = true;
      break;
      
    case GAME_STATES.PLAYING:
      UI.pauseBtn.disabled = false;
      UI.restartBtn2.disabled = false;
      UI.pauseBtn.textContent = '暂停';
      if (previousState === GAME_STATES.IDLE || previousState === GAME_STATES.GAME_OVER) {
        achievementSystem.resetGameSession();
      }
      break;
      
    case GAME_STATES.PAUSED:
      UI.pauseOverlay.classList.remove('hidden');
      UI.pauseBtn.textContent = '继续';
      break;
      
    case GAME_STATES.GAME_OVER:
      UI.pauseBtn.disabled = true;
      UI.pauseBtn.textContent = '暂停';
      break;
  }
  
  previousState = state;
}

function handleGameOver(score, isNewRecord) {
  UI.finalScoreEl.textContent = score;
  UI.finalHighScoreEl.textContent = scoreManager.getHighScore();
  
  if (isNewRecord) {
    UI.newRecordEl.classList.remove('hidden');
    achievementSystem.notify('high_score_broken', true);
    achievementSystem.check(game);
  } else {
    UI.newRecordEl.classList.add('hidden');
  }
  
  updateHighScoreUI();
  UI.gameOverOverlay.classList.remove('hidden');
}

game.onStateChange = handleStateChange;
game.onScoreChange = updateScoreUI;
game.onLivesChange = updateLivesUI;
game.onLevelChange = updateLevelUI;
game.onGameOver = handleGameOver;

game.registerLevelSystem(levelSystem);
game.registerPowerUpSystem(powerUpSystem);
game.registerAchievementSystem(achievementSystem);

achievementSystem.onUnlock(showAchievementToast);

UI.startBtn.addEventListener('click', () => {
  game.start();
});

UI.pauseBtn.addEventListener('click', () => {
  if (game.getState() === GAME_STATES.PLAYING) {
    game.pause();
  } else if (game.getState() === GAME_STATES.PAUSED) {
    game.resume();
  }
});

UI.resumeBtn.addEventListener('click', () => {
  game.resume();
});

UI.restartBtn.addEventListener('click', () => {
  game.restart();
});

UI.restartBtn2.addEventListener('click', () => {
  game.restart();
});

UI.restartFromPauseBtn.addEventListener('click', () => {
  game.restart();
});

function resizeCanvas() {
  const wrapper = UI.canvas.parentElement;
  const maxWidth = wrapper.clientWidth;
  const aspectRatio = CONFIG.game.canvasWidth / CONFIG.game.canvasHeight;
  
  let displayWidth = maxWidth;
  let displayHeight = displayWidth / aspectRatio;
  
  UI.canvas.style.width = `${displayWidth}px`;
  UI.canvas.style.height = `${displayHeight}px`;
}

window.addEventListener('resize', resizeCanvas);

updateHighScoreUI();
updateScoreUI(0);
updateLivesUI(CONFIG.game.initialLives);
updateLevelUI(game.getLevel());
resizeCanvas();
game.renderIdle();

function idleLoop() {
  if (game.getState() === GAME_STATES.IDLE || game.getState() === GAME_STATES.GAME_OVER) {
    game.renderIdle();
  }
  requestAnimationFrame(idleLoop);
}
idleLoop();

console.log('🚀 星星收集者游戏已加载完成！');
console.log('📖 操作说明：');
console.log('   - 方向键 / WASD：移动');
console.log('   - P / ESC：暂停/继续');
console.log('   - 空格：开始游戏');
console.log('💡 扩展接口已就绪，可随时注册关卡、道具、敌人、成就和音效系统');

function showAchievementToast(achievement, unlockData) {
  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.innerHTML = `
    <div class="achievement-toast-icon">${achievement.icon}</div>
    <div class="achievement-toast-content">
      <div class="achievement-toast-label">成就解锁</div>
      <div class="achievement-toast-name">${achievement.name}</div>
      <div class="achievement-toast-desc">${achievement.description}</div>
    </div>
  `;
  
  UI.achievementToastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function openAchievements() {
  renderAchievementsList();
  UI.achievementsOverlay.classList.remove('hidden');
  if (game.getState() === GAME_STATES.PLAYING) {
    game.pause();
  }
}

function closeAchievements() {
  UI.achievementsOverlay.classList.add('hidden');
}

function renderAchievementsList() {
  const allAchievements = achievementSystem.getAllAchievements();
  const unlockedCount = achievementSystem.getUnlockedCount();
  const totalCount = achievementSystem.getTotalCount();
  
  UI.achievementsProgress.textContent = `${unlockedCount} / ${totalCount}`;
  
  UI.achievementsContent.innerHTML = allAchievements.map(achievement => `
    <div class="achievement-item ${achievement.unlocked ? 'unlocked' : ''}">
      <div class="achievement-item-icon">${achievement.icon}</div>
      <div class="achievement-item-content">
        <div class="achievement-item-name">${achievement.name}</div>
        <div class="achievement-item-desc">${achievement.description}</div>
      </div>
      <div class="achievement-item-status ${achievement.unlocked ? 'unlocked' : 'locked'}">
        ${achievement.unlocked ? '已解锁' : '未解锁'}
      </div>
    </div>
  `).join('');
}

window.__game = game;
window.__scoreManager = scoreManager;
window.__inputManager = inputManager;
window.__settingsManager = settingsManager;
window.__achievementSystem = achievementSystem;

function initSettingsUI() {
  const settings = settingsManager.getSettings();
  
  UI.soundToggle.checked = settings.soundEnabled;
  
  UI.speedBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.speed === settings.speedLevel);
  });
  
  UI.touchModeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === settings.touchMode);
  });
  
  inputManager.setTouchMode(settings.touchMode);
}

function openSettings() {
  UI.settingsOverlay.classList.remove('hidden');
  if (game.getState() === GAME_STATES.PLAYING) {
    game.pause();
  }
}

function closeSettings() {
  UI.settingsOverlay.classList.add('hidden');
}

function handleSoundToggle() {
  settingsManager.setSoundEnabled(UI.soundToggle.checked);
}

function handleSpeedChange(e) {
  const speed = e.target.dataset.speed;
  if (!speed) return;
  
  UI.speedBtns.forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');
  settingsManager.setSpeedLevel(speed);
}

function handleTouchModeChange(e) {
  const mode = e.target.dataset.mode;
  if (!mode) return;
  
  UI.touchModeBtns.forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');
  settingsManager.setTouchMode(mode);
}

function handleSettingsReset() {
  settingsManager.reset();
  initSettingsUI();
}

function handleSettingsChange(key, newValue, oldValue) {
  switch (key) {
    case 'touchMode':
      inputManager.setTouchMode(newValue);
      break;
  }
}

initSettingsUI();
settingsManager.onChange(handleSettingsChange);

UI.settingsBtn.addEventListener('click', openSettings);
UI.settingsCloseBtn.addEventListener('click', closeSettings);
UI.soundToggle.addEventListener('change', handleSoundToggle);
UI.speedBtns.forEach(btn => btn.addEventListener('click', handleSpeedChange));
UI.touchModeBtns.forEach(btn => btn.addEventListener('click', handleTouchModeChange));
UI.settingsResetBtn.addEventListener('click', handleSettingsReset);

UI.achievementsBtn.addEventListener('click', openAchievements);
UI.achievementsCloseBtn.addEventListener('click', closeAchievements);

UI.achievementsOverlay.addEventListener('click', (e) => {
  if (e.target === UI.achievementsOverlay) {
    closeAchievements();
  }
});

UI.settingsOverlay.addEventListener('click', (e) => {
  if (e.target === UI.settingsOverlay) {
    closeSettings();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!UI.settingsOverlay.classList.contains('hidden')) {
      closeSettings();
    } else if (!UI.achievementsOverlay.classList.contains('hidden')) {
      closeAchievements();
    }
  }
});
