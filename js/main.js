import { CONFIG, GAME_STATES, TRAINING_PRESETS } from './config.js';
import { Game } from './game.js';
import { InputManager } from './input.js';
import { StorageManager } from './storage.js';
import { ScoreManager } from './score.js';
import { LevelSystem } from './levels.js';
import { PowerUpSystem } from './powerups.js';
import { AchievementSystem } from './achievements.js';
import { SettingsManager, DEFAULT_SETTINGS } from './settings.js';
import { DailyChallengeSystem } from './dailyChallenge.js';
import { StatsSystem } from './stats.js';
import { SkinManager } from './skins.js';

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
  achievementToastContainer: document.getElementById('achievementToastContainer'),
  dailyChallengeCard: document.getElementById('dailyChallengeCard'),
  challengeCardIcon: document.getElementById('challengeCardIcon'),
  challengeCardTitle: document.getElementById('challengeCardTitle'),
  challengeCardDesc: document.getElementById('challengeCardDesc'),
  challengeCardStatus: document.getElementById('challengeCardStatus'),
  challengeProgressBar: document.getElementById('challengeProgressBar'),
  challengeProgressIcon: document.getElementById('challengeProgressIcon'),
  challengeProgressLabel: document.getElementById('challengeProgressLabel'),
  challengeProgressValue: document.getElementById('challengeProgressValue'),
  challengeProgressFill: document.getElementById('challengeProgressFill'),
  challengeResultCard: document.getElementById('challengeResultCard'),
  challengeResultIcon: document.getElementById('challengeResultIcon'),
  challengeResultName: document.getElementById('challengeResultName'),
  challengeResultDesc: document.getElementById('challengeResultDesc'),
  challengeResultStatus: document.getElementById('challengeResultStatus'),
  challengeResultProgressFill: document.getElementById('challengeResultProgressFill'),
  challengeResultProgressText: document.getElementById('challengeResultProgressText'),
  statsBtn: document.getElementById('statsBtn'),
  statsOverlay: document.getElementById('statsOverlay'),
  statsCloseBtn: document.getElementById('statsCloseBtn'),
  statsContent: document.getElementById('statsContent'),
  skinsBtn: document.getElementById('skinsBtn'),
  skinsBtnStart: document.getElementById('skinsBtnStart'),
  skinsOverlay: document.getElementById('skinsOverlay'),
  skinsCloseBtn: document.getElementById('skinsCloseBtn'),
  skinsContent: document.getElementById('skinsContent'),
  skinsProgress: document.getElementById('skinsProgress'),
  skinsPreview: document.getElementById('skinsPreview'),
  skinTabs: document.querySelectorAll('.skin-tab'),
  trainingBtn: document.getElementById('trainingBtn'),
  trainingOverlay: document.getElementById('trainingOverlay'),
  trainingBackBtn: document.getElementById('trainingBackBtn'),
  presetItems: document.querySelectorAll('.preset-item'),
  trainingControls: document.getElementById('trainingControls'),
  trainingStars: document.getElementById('trainingStars'),
  trainingTime: document.getElementById('trainingTime'),
  presetSelect: document.getElementById('presetSelect'),
  exitTrainingBtn: document.getElementById('exitTrainingBtn')
};

const storage = new StorageManager();
const scoreManager = new ScoreManager(storage);
const inputManager = new InputManager();
const settingsManager = new SettingsManager(storage);
const achievementSystem = new AchievementSystem(storage);
const dailyChallengeSystem = new DailyChallengeSystem(storage);
const statsSystem = new StatsSystem(storage);
const levelSystem = new LevelSystem(CONFIG.levels);
const powerUpSystem = new PowerUpSystem(CONFIG.powerUps);
const skinManager = new SkinManager(storage);
const game = new Game(UI.canvas, CONFIG);

inputManager.setTouchControlsElement(UI.touchControls);
game.init(scoreManager, inputManager);
game.registerSettingsManager(settingsManager);
game.registerSkinManager(skinManager);

function updateScoreUI(score) {
  UI.scoreEl.textContent = score;
  if (game.getState() === GAME_STATES.PLAYING) {
    updateChallengeProgress();
  }
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
  UI.trainingOverlay.classList.add('hidden');
}

function updateDailyChallengeCard() {
  const challenge = dailyChallengeSystem.getTodayChallenge();
  const isCompleted = dailyChallengeSystem.isTodayCompleted();

  UI.challengeCardIcon.textContent = challenge.icon;
  UI.challengeCardTitle.textContent = challenge.title;
  UI.challengeCardDesc.textContent = challenge.description;

  if (isCompleted) {
    UI.dailyChallengeCard.classList.add('completed');
    UI.challengeCardStatus.textContent = '✓ 已完成';
    UI.challengeCardStatus.classList.add('completed');
  } else {
    UI.dailyChallengeCard.classList.remove('completed');
    UI.challengeCardStatus.textContent = '进行中';
    UI.challengeCardStatus.classList.remove('completed');
  }
}

function showChallengeProgress() {
  const challenge = dailyChallengeSystem.getTodayChallenge();
  UI.challengeProgressIcon.textContent = challenge.icon;
  UI.challengeProgressLabel.textContent = challenge.title;
  UI.challengeProgressBar.classList.remove('hidden');
  UI.challengeProgressBar.classList.remove('completed');
  UI.challengeProgressBar.classList.remove('failed');
  updateChallengeProgress();
}

function hideChallengeProgress() {
  UI.challengeProgressBar.classList.add('hidden');
}

function updateChallengeProgress() {
  const display = dailyChallengeSystem.getProgressDisplay();
  const result = dailyChallengeSystem.getSessionResult();

  if (display) {
    UI.challengeProgressValue.textContent = `${display.value} / ${display.total}`;
    const progress = result ? result.progress : 0;
    UI.challengeProgressFill.style.width = `${progress}%`;
  }

  if (result) {
    UI.challengeProgressBar.classList.toggle('completed', result.completed);
    UI.challengeProgressBar.classList.toggle('failed', result.failed && !result.completed);
  }
}

function updateChallengeResult() {
  const result = dailyChallengeSystem.getSessionResult();
  if (!result) return;

  const { challenge, completed, failed, progress, alreadyCompletedToday, completedThisSession, failedReason } = result;

  UI.challengeResultIcon.textContent = challenge.icon;
  UI.challengeResultName.textContent = challenge.title;
  UI.challengeResultDesc.textContent = challenge.description;

  UI.challengeResultStatus.classList.remove('success', 'failed', 'already');
  UI.challengeResultProgressFill.classList.remove('success', 'failed');

  if (completedThisSession) {
    UI.challengeResultStatus.textContent = '🎉 挑战完成！';
    UI.challengeResultStatus.classList.add('success');
  } else if (failed) {
    UI.challengeResultStatus.textContent = failedReason || '挑战未完成';
    UI.challengeResultStatus.classList.add('failed');
  } else if (alreadyCompletedToday && !completed) {
    UI.challengeResultStatus.textContent = '今日挑战已完成 ✓';
    UI.challengeResultStatus.classList.add('already');
  } else if (completed) {
    UI.challengeResultStatus.textContent = '🎉 挑战完成！';
    UI.challengeResultStatus.classList.add('success');
  } else {
    UI.challengeResultStatus.textContent = '挑战未完成';
    UI.challengeResultStatus.classList.add('failed');
  }

  const progressPercent = Math.round(progress);
  UI.challengeResultProgressFill.style.width = `${progressPercent}%`;
  UI.challengeResultProgressText.textContent = `${progressPercent}%`;

  if (completedThisSession || completed) {
    UI.challengeResultProgressFill.classList.add('success');
  } else if (failed) {
    UI.challengeResultProgressFill.classList.add('failed');
  }
}

let previousState = GAME_STATES.IDLE;

function handleStateChange(state) {
  hideAllOverlays();
  
  if (state === GAME_STATES.TRAINING || previousState === GAME_STATES.TRAINING) {
    UI.trainingControls.classList.toggle('hidden', state !== GAME_STATES.TRAINING && state !== GAME_STATES.PAUSED);
  }
  
  switch (state) {
    case GAME_STATES.IDLE:
      UI.startOverlay.classList.remove('hidden');
      UI.pauseBtn.disabled = true;
      UI.restartBtn2.disabled = true;
      updateDailyChallengeCard();
      hideChallengeProgress();
      break;
      
    case GAME_STATES.PLAYING:
      UI.pauseBtn.disabled = false;
      UI.restartBtn2.disabled = false;
      UI.pauseBtn.textContent = '暂停';
      if (previousState === GAME_STATES.IDLE || previousState === GAME_STATES.GAME_OVER) {
        achievementSystem.resetGameSession();
        dailyChallengeSystem.resetSessionProgress();
      }
      showChallengeProgress();
      break;
      
    case GAME_STATES.TRAINING:
      UI.pauseBtn.disabled = false;
      UI.restartBtn2.disabled = true;
      UI.pauseBtn.textContent = '暂停';
      hideChallengeProgress();
      break;
      
    case GAME_STATES.PAUSED:
      UI.pauseOverlay.classList.remove('hidden');
      UI.pauseBtn.textContent = '继续';
      break;
      
    case GAME_STATES.GAME_OVER:
      UI.pauseBtn.disabled = true;
      UI.pauseBtn.textContent = '暂停';
      hideChallengeProgress();
      break;
  }

  previousState = state;
}

function handleGameOver(score, isNewRecord, sessionStats) {
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
  updateChallengeResult();
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
game.registerDailyChallengeSystem(dailyChallengeSystem);
game.registerStatsSystem(statsSystem);

achievementSystem.onUnlock(showAchievementToast);

dailyChallengeSystem.onCompletion((challenge) => {
  showChallengeCompletionToast(challenge);
  updateDailyChallengeCard();
  updateChallengeProgress();
});

function showChallengeCompletionToast(challenge) {
  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.innerHTML = `
    <div class="achievement-toast-icon">${challenge.icon}</div>
    <div class="achievement-toast-content">
      <div class="achievement-toast-label" style="color: var(--accent-green);">每日挑战完成</div>
      <div class="achievement-toast-name">${challenge.title}</div>
      <div class="achievement-toast-desc">${challenge.description}</div>
    </div>
  `;
  
  UI.achievementToastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function openTraining() {
  hideAllOverlays();
  UI.trainingOverlay.classList.remove('hidden');
}

function closeTraining() {
  UI.trainingOverlay.classList.add('hidden');
  UI.startOverlay.classList.remove('hidden');
}

function startTraining(presetKey) {
  hideAllOverlays();
  UI.presetSelect.value = presetKey;
  game.startTraining(presetKey);
}

function updateTrainingStats() {
  if (!game.isTraining()) return;
  
  const stats = game.getTrainingStats();
  UI.trainingStars.textContent = stats.starsCollected;
  
  const totalSeconds = Math.floor(stats.duration / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  UI.trainingTime.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function handlePresetChange(e) {
  const presetKey = e.target.value;
  if (game.isTraining()) {
    game.changeTrainingPreset(presetKey);
  }
}

function exitTraining() {
  game.exitTraining();
}

UI.trainingBtn.addEventListener('click', openTraining);
UI.trainingBackBtn.addEventListener('click', closeTraining);

UI.presetItems.forEach(item => {
  item.addEventListener('click', () => {
    const presetKey = item.dataset.preset;
    startTraining(presetKey);
  });
});

UI.presetSelect.addEventListener('change', handlePresetChange);
UI.exitTrainingBtn.addEventListener('click', exitTraining);

UI.startBtn.addEventListener('click', () => {
  game.start();
});

UI.pauseBtn.addEventListener('click', () => {
  if (game.getState() === GAME_STATES.PLAYING || game.getState() === GAME_STATES.TRAINING) {
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
updateDailyChallengeCard();
resizeCanvas();
game.renderIdle();

let lastChallengeCheck = 0;

function idleLoop() {
  const now = Date.now();
  
  if (game.getState() === GAME_STATES.IDLE || game.getState() === GAME_STATES.GAME_OVER) {
    game.renderIdle();
  }
  
  if (game.getState() === GAME_STATES.PLAYING && now - lastChallengeCheck > 500) {
    dailyChallengeSystem.checkCompletion();
    updateChallengeProgress();
    lastChallengeCheck = now;
  }
  
  if (game.isTraining() && now - lastChallengeCheck > 500) {
    updateTrainingStats();
    lastChallengeCheck = now;
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
window.__dailyChallengeSystem = dailyChallengeSystem;
window.__statsSystem = statsSystem;
window.__skinManager = skinManager;

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

function openStats() {
  renderStatsPanel();
  UI.statsOverlay.classList.remove('hidden');
  if (game.getState() === GAME_STATES.PLAYING) {
    game.pause();
  }
}

function closeStats() {
  UI.statsOverlay.classList.add('hidden');
}

function renderStatsPanel() {
  const stats = statsSystem.getStats();
  
  const statItems = [
    { icon: '🎮', label: '累计游戏次数', value: stats.totalGames, class: '' },
    { icon: '⭐', label: '累计收集星星数', value: stats.totalStars, class: 'highlight' },
    { icon: '💥', label: '累计碰撞次数', value: stats.totalCollisions, class: 'collision' },
    { icon: '🏆', label: '最高等级', value: stats.highestLevel, class: 'level' },
    { icon: '🎁', label: '道具拾取次数', value: stats.totalPowerUps, class: '' },
    { icon: '⏱️', label: '最长单局存活时间', value: statsSystem.formatSurvivalTime(stats.longestSurvivalTime), class: 'highlight' }
  ];
  
  UI.statsContent.innerHTML = statItems.map(item => `
    <div class="stat-item ${item.class}">
      <div class="stat-item-icon">${item.icon}</div>
      <div class="stat-item-content">
        <div class="stat-item-label">${item.label}</div>
        <div class="stat-item-value">${item.value}</div>
      </div>
    </div>
  `).join('');
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

UI.statsBtn.addEventListener('click', openStats);
UI.statsCloseBtn.addEventListener('click', closeStats);

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

UI.statsOverlay.addEventListener('click', (e) => {
  if (e.target === UI.statsOverlay) {
    closeStats();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!UI.settingsOverlay.classList.contains('hidden')) {
      closeSettings();
    } else if (!UI.achievementsOverlay.classList.contains('hidden')) {
      closeAchievements();
    } else if (!UI.statsOverlay.classList.contains('hidden')) {
      closeStats();
    } else if (!UI.skinsOverlay.classList.contains('hidden')) {
      closeSkins();
    }
  }
});

let currentSkinTab = 'player';
let previewAnimationId = null;

function openSkins() {
  UI.skinsOverlay.classList.remove('hidden');
  if (game.getState() === GAME_STATES.PLAYING) {
    game.pause();
  }
  renderSkinsList();
  startSkinPreviewAnimation();
}

function closeSkins() {
  UI.skinsOverlay.classList.add('hidden');
  stopSkinPreviewAnimation();
}

function handleSkinTabChange(e) {
  const tab = e.target.dataset.tab;
  if (!tab) return;
  
  currentSkinTab = tab;
  
  UI.skinTabs.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  
  renderSkinsList();
}

function renderSkinsList() {
  const allSkins = skinManager.getAllSkins(currentSkinTab);
  const unlockedCount = allSkins.filter(s => s.unlocked).length;
  const totalCount = allSkins.length;
  
  UI.skinsProgress.textContent = `${unlockedCount} / ${totalCount}`;
  
  UI.skinsContent.innerHTML = allSkins.map(skin => {
    const progress = skinManager.getUnlockProgress(skin.id);
    const isLocked = !skin.unlocked;
    const isSelected = skin.selected;
    
    let statusHtml = '';
    if (isSelected) {
      statusHtml = `<div class="skin-item-status selected">${getSkinCategoryLabel(currentSkinTab)}使用中</div>`;
    } else if (isLocked) {
      statusHtml = `<div class="skin-item-status locked">未解锁</div>`;
    } else {
      statusHtml = `<div class="skin-item-status unlocked">已解锁</div>`;
    }
    
    let progressHtml = '';
    if (isLocked && skin.unlock.type !== 'default') {
      progressHtml = `
        <div class="skin-item-progress">
          <div class="skin-item-progress-track">
            <div class="skin-item-progress-fill" style="width: ${progress.percent}%"></div>
          </div>
          <div class="skin-item-progress-text">${progress.current} / ${progress.total}</div>
        </div>
      `;
    }
    
    const lockIcon = isLocked ? '<div class="skin-item-lock">🔒</div>' : '';
    
    const previewHtml = isLocked 
      ? `<div class="skin-item-icon">${skin.icon}</div>`
      : `<div class="skin-item-preview"><canvas data-skin-id="${skin.id}" width="60" height="60"></canvas></div>`;
    
    let displayDesc = getSkinCategoryDescription(skin, currentSkinTab);
    if (isLocked && skin.unlock.description) {
      displayDesc = skin.unlock.description;
    }
    
    return `
      <div class="skin-item ${isLocked ? 'locked' : ''} ${isSelected ? 'selected' : ''}" data-skin-id="${skin.id}">
        ${lockIcon}
        ${previewHtml}
        <div class="skin-item-info">
          <div class="skin-item-name">${skin.name}</div>
          <div class="skin-item-desc">${displayDesc}</div>
          ${statusHtml}
          ${progressHtml}
        </div>
      </div>
    `;
  }).join('');
  
  setTimeout(() => {
    allSkins.forEach(skin => {
      if (skin.unlocked) {
        const canvas = UI.skinsContent.querySelector(`canvas[data-skin-id="${skin.id}"]`);
        if (canvas) {
          renderSkinPreviewIcon(canvas, skin, currentSkinTab);
        }
      }
    });
  }, 0);
  
  UI.skinsContent.querySelectorAll('.skin-item').forEach(item => {
    item.addEventListener('click', () => {
      const skinId = item.dataset.skinId;
      if (skinManager.isUnlocked(skinId)) {
        skinManager.selectSkin(skinId, currentSkinTab);
        renderSkinsList();
      }
    });
  });
}

function getSkinCategoryLabel(category) {
  switch (category) {
    case 'trail':
      return '拖尾';
    case 'effect':
      return '特效';
    case 'player':
    default:
      return '外观';
  }
}

function getSkinCategoryDescription(skin, category) {
  switch (category) {
    case 'trail':
      return `拖尾颜色 ${skin.trail.color}，长度 ${skin.trail.length}`;
    case 'effect':
      return `拾取特效 ${getPickupEffectLabel(skin.pickupEffect.type)}，粒子 ${skin.pickupEffect.particleCount}`;
    case 'player':
    default:
      return skin.description;
  }
}

function getPickupEffectLabel(type) {
  switch (type) {
    case 'explosion':
      return '爆裂';
    case 'ring':
      return '光环';
    case 'rainbow':
      return '彩虹';
    case 'sparkle':
    default:
      return '星芒';
  }
}

function renderSkinPreviewIcon(canvas, skin, category = 'player') {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const center = size / 2;
  
  ctx.clearRect(0, 0, size, size);

  if (category === 'trail') {
    renderTrailPreviewIcon(ctx, skin, size, center);
    return;
  }

  if (category === 'effect') {
    renderEffectPreviewIcon(ctx, skin, size, center);
    return;
  }
  
  const playerSkin = skin.player;
  let bodyColor = playerSkin.color;
  let innerColor = playerSkin.innerColor;
  let outerColor = playerSkin.outerColor;
  let glowColor = playerSkin.glowColor;
  
  if (playerSkin.rainbow) {
    const hue = (Date.now() * 0.1) % 360;
    bodyColor = `hsl(${hue}, 70%, 55%)`;
    glowColor = `hsla(${hue}, 70%, 55%, 0.6)`;
    innerColor = `hsl(${hue}, 80%, 85%)`;
    outerColor = `hsl(${hue}, 70%, 35%)`;
  }
  
  ctx.save();
  ctx.translate(center, center);
  
  ctx.shadowBlur = 15;
  ctx.shadowColor = glowColor;
  
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 3);
  gradient.addColorStop(0, innerColor);
  gradient.addColorStop(0.3, bodyColor);
  gradient.addColorStop(1, outerColor);
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  
  const radius = size / 3;
  switch (playerSkin.shape) {
    case 'star':
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
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
      break;
    case 'diamond':
      ctx.moveTo(0, -radius);
      ctx.lineTo(radius * 0.7, 0);
      ctx.lineTo(0, radius);
      ctx.lineTo(-radius * 0.7, 0);
      ctx.closePath();
      break;
    default:
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      break;
  }
  ctx.fill();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(-radius / 3, -radius / 3, radius / 4, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function renderTrailPreviewIcon(ctx, skin, size, center) {
  const trail = skin.trail;
  const count = Math.min(6, Math.max(4, Math.round(trail.length / 3)));
  
  for (let i = 0; i < count; i++) {
    const progress = i / (count - 1);
    const alpha = 0.25 + progress * 0.55;
    const radius = size * (0.08 + progress * 0.06);
    const x = size * (0.2 + progress * 0.6);
    const y = center + Math.sin(progress * Math.PI * 1.2) * size * 0.18;
    let color = trail.color;
    
    if (trail.rainbow) {
      color = `hsl(${progress * 300}, 80%, 60%)`;
    }
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function renderEffectPreviewIcon(ctx, skin, size, center) {
  const effect = skin.pickupEffect;
  const count = Math.min(10, effect.particleCount || 8);
  
  if (effect.type === 'ring') {
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = effect.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = effect.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(center, center, size * 0.28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = size * 0.27;
    let color = effect.color;
    
    if (effect.type === 'rainbow') {
      color = `hsl(${(i / count) * 360}, 80%, 60%)`;
    }
    
    ctx.save();
    ctx.translate(center + Math.cos(angle) * radius, center + Math.sin(angle) * radius);
    ctx.rotate(angle);
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    if (effect.type === 'sparkle' || effect.type === 'rainbow') {
      for (let j = 0; j < 8; j++) {
        const starAngle = (j * Math.PI) / 4 - Math.PI / 2;
        const r = j % 2 === 0 ? size * 0.08 : size * 0.035;
        const x = Math.cos(starAngle) * r;
        const y = Math.sin(starAngle) * r;
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
    } else {
      ctx.arc(0, 0, size * 0.045, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  }
}

function startSkinPreviewAnimation() {
  if (previewAnimationId) return;
  
  function animate() {
    const currentSkin = skinManager.getCurrentSkin();
    
    UI.skinsPreview.innerHTML = '<canvas width="80" height="80"></canvas>';
    const canvas = UI.skinsPreview.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    
    renderSkinPreviewIcon(canvas, currentSkin);
    
    previewAnimationId = requestAnimationFrame(animate);
  }
  
  animate();
}

function stopSkinPreviewAnimation() {
  if (previewAnimationId) {
    cancelAnimationFrame(previewAnimationId);
    previewAnimationId = null;
  }
}

function showSkinUnlockToast(skin) {
  const toast = document.createElement('div');
  toast.className = 'achievement-toast skin-unlock-toast';
  toast.innerHTML = `
    <div class="achievement-toast-icon">${skin.icon}</div>
    <div class="achievement-toast-content">
      <div class="achievement-toast-label" style="color: #fbcfe8;">🎨 新皮肤解锁</div>
      <div class="achievement-toast-name">${skin.name}</div>
      <div class="achievement-toast-desc">${skin.description}</div>
    </div>
  `;
  
  UI.achievementToastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

game.onSkinUnlock = (skin) => {
  showSkinUnlockToast(skin);
};

skinManager.onChange((type, newValue, oldValue) => {
  if (type === 'unlock') {
    const skin = skinManager.getSkin(newValue);
    if (skin) {
      showSkinUnlockToast(skin);
    }
  }
});

UI.skinsBtn.addEventListener('click', openSkins);
UI.skinsBtnStart.addEventListener('click', openSkins);
UI.skinsCloseBtn.addEventListener('click', closeSkins);

UI.skinTabs.forEach(tab => {
  tab.addEventListener('click', handleSkinTabChange);
});

UI.skinsOverlay.addEventListener('click', (e) => {
  if (e.target === UI.skinsOverlay) {
    closeSkins();
  }
});

skinManager.checkUnlocks(
  { currentScore: 0 },
  achievementSystem,
  scoreManager
);
