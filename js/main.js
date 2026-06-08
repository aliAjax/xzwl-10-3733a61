import { CONFIG, GAME_STATES } from './config.js';
import { Game } from './game.js';
import { InputManager } from './input.js';
import { StorageManager } from './storage.js';
import { ScoreManager } from './score.js';
import { LevelSystem } from './levels.js';

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
  restartFromPauseBtn: document.getElementById('restartFromPauseBtn')
};

const storage = new StorageManager();
const scoreManager = new ScoreManager(storage);
const inputManager = new InputManager();
const levelSystem = new LevelSystem(CONFIG.levels);
const game = new Game(UI.canvas, CONFIG);

game.init(scoreManager, inputManager);
game.registerLevelSystem(levelSystem);

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
}

function handleGameOver(score, isNewRecord) {
  UI.finalScoreEl.textContent = score;
  UI.finalHighScoreEl.textContent = scoreManager.getHighScore();
  
  if (isNewRecord) {
    UI.newRecordEl.classList.remove('hidden');
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

window.__game = game;
window.__scoreManager = scoreManager;
window.__inputManager = inputManager;
