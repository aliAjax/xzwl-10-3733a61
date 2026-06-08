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
import { CustomChallengeSystem, CHALLENGE_MODES } from './customChallenge.js';
import { StatsSystem } from './stats.js';
import { SkinManager } from './skins.js';
import { REPLAY_STATES } from './replay.js';

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
  trainingStats: document.getElementById('trainingStats'),
  trainingStars: document.getElementById('trainingStars'),
  trainingTime: document.getElementById('trainingTime'),
  presetSelect: document.getElementById('presetSelect'),
  exitTrainingBtn: document.getElementById('exitTrainingBtn'),
  watchReplayBtn: document.getElementById('watchReplayBtn'),
  replayOverlay: document.getElementById('replayOverlay'),
  replayFinalScore: document.getElementById('replayFinalScore'),
  replayFinalLevel: document.getElementById('replayFinalLevel'),
  replayDuration: document.getElementById('replayDuration'),
  replayCurrentScore: document.getElementById('replayCurrentScore'),
  replayCurrentLives: document.getElementById('replayCurrentLives'),
  replayCurrentLevel: document.getElementById('replayCurrentLevel'),
  replayCurrentTime: document.getElementById('replayCurrentTime'),
  replayTotalTime: document.getElementById('replayTotalTime'),
  replayProgressBar: document.getElementById('replayProgressBar'),
  replayProgressFill: document.getElementById('replayProgressFill'),
  replayPlayPauseBtn: document.getElementById('replayPlayPauseBtn'),
  replayRestartBtn: document.getElementById('replayRestartBtn'),
  replaySpeedBtn: document.getElementById('replaySpeedBtn'),
  replayExitBtn: document.getElementById('replayExitBtn'),
  replayBackBtn: document.getElementById('replayBackBtn'),
  challengeModeTabs: document.querySelectorAll('.challenge-mode-tab'),
  customChallengeCard: document.getElementById('customChallengeCard'),
  customChallengeCardBody: document.getElementById('customChallengeCardBody'),
  customChallengeCardStatus: document.getElementById('customChallengeCardStatus'),
  manageCustomChallengesBtn: document.getElementById('manageCustomChallengesBtn'),
  customChallengesOverlay: document.getElementById('customChallengesOverlay'),
  customChallengesCloseBtn: document.getElementById('customChallengesCloseBtn'),
  customChallengesBackBtn: document.getElementById('customChallengesBackBtn'),
  customChallengesList: document.getElementById('customChallengesList'),
  createChallengeBtn: document.getElementById('createChallengeBtn'),
  createChallengeOverlay: document.getElementById('createChallengeOverlay'),
  createChallengeCloseBtn: document.getElementById('createChallengeCloseBtn'),
  cancelCreateChallengeBtn: document.getElementById('cancelCreateChallengeBtn'),
  confirmCreateChallengeBtn: document.getElementById('confirmCreateChallengeBtn'),
  challengeTypeSelect: document.getElementById('challengeTypeSelect'),
  targetRange: document.getElementById('targetRange'),
  targetRangeValue: document.getElementById('targetRangeValue'),
  targetLabel: document.getElementById('targetLabel'),
  targetGroup: document.getElementById('targetGroup'),
  constraintRange: document.getElementById('constraintRange'),
  constraintRangeValue: document.getElementById('constraintRangeValue'),
  constraintLabel: document.getElementById('constraintLabel'),
  constraintGroup: document.getElementById('constraintGroup'),
  iconSelector: document.getElementById('iconSelector'),
  colorSelector: document.getElementById('colorSelector'),
  challengeTitleInput: document.getElementById('challengeTitleInput'),
  challengePreviewIcon: document.getElementById('challengePreviewIcon'),
  challengePreviewTitle: document.getElementById('challengePreviewTitle'),
  challengePreviewDesc: document.getElementById('challengePreviewDesc')
};

const storage = new StorageManager();
const scoreManager = new ScoreManager(storage);
const inputManager = new InputManager();
const settingsManager = new SettingsManager(storage);
const achievementSystem = new AchievementSystem(storage);
const dailyChallengeSystem = new DailyChallengeSystem(storage);
const customChallengeSystem = new CustomChallengeSystem(storage);
const statsSystem = new StatsSystem(storage);
const levelSystem = new LevelSystem(CONFIG.levels);
const powerUpSystem = new PowerUpSystem(CONFIG.powerUps);
const skinManager = new SkinManager(storage);
const game = new Game(UI.canvas, CONFIG);

let activeChallengeMode = CHALLENGE_MODES.DAILY;

inputManager.setTouchControlsElement(UI.touchControls);
game.init(scoreManager, inputManager);
game.setActiveChallengeMode(activeChallengeMode);
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
  UI.replayOverlay.classList.add('hidden');
  UI.customChallengesOverlay.classList.add('hidden');
  UI.createChallengeOverlay.classList.add('hidden');
}

function getActiveChallengeSystem() {
  switch (activeChallengeMode) {
    case CHALLENGE_MODES.CUSTOM:
      return customChallengeSystem;
    case CHALLENGE_MODES.DAILY:
    default:
      return dailyChallengeSystem;
  }
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

function updateCustomChallengeCard() {
  const activeChallenge = customChallengeSystem.getActiveChallenge();
  
  if (!activeChallenge) {
    UI.customChallengeCardBody.innerHTML = `
      <div class="challenge-card-icon">➕</div>
      <div class="challenge-card-info">
        <div class="challenge-card-title">暂无选中的挑战</div>
        <div class="challenge-card-desc">点击下方按钮创建或选择挑战</div>
      </div>
    `;
    UI.customChallengeCardStatus.textContent = '未选择';
    UI.customChallengeCardStatus.classList.remove('completed');
    return;
  }

  const isCompleted = customChallengeSystem.isActiveChallengeCompleted();
  const bestProgress = Math.round(activeChallenge.bestProgress || 0);

  UI.customChallengeCardBody.innerHTML = `
    <div class="challenge-card-icon">${activeChallenge.icon}</div>
    <div class="challenge-card-info">
      <div class="challenge-card-title">${activeChallenge.title}</div>
      <div class="challenge-card-desc">${activeChallenge.description}</div>
      <div class="challenge-card-progress">最佳进度: ${bestProgress}%</div>
    </div>
  `;

  if (isCompleted) {
    UI.customChallengeCard.classList.add('completed');
    UI.customChallengeCardStatus.textContent = '✓ 已完成';
    UI.customChallengeCardStatus.classList.add('completed');
  } else {
    UI.customChallengeCard.classList.remove('completed');
    UI.customChallengeCardStatus.textContent = '进行中';
    UI.customChallengeCardStatus.classList.remove('completed');
  }
}

function showChallengeProgress() {
  const system = getActiveChallengeSystem();
  let challenge;
  
  if (activeChallengeMode === CHALLENGE_MODES.CUSTOM) {
    challenge = customChallengeSystem.getActiveChallenge();
    if (!challenge) {
      hideChallengeProgress();
      return;
    }
  } else {
    challenge = dailyChallengeSystem.getTodayChallenge();
  }
  
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
  const system = getActiveChallengeSystem();
  const display = system.getProgressDisplay();
  const result = system.getSessionResult();

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
  const system = getActiveChallengeSystem();
  const result = system.getSessionResult();
  
  if (activeChallengeMode === CHALLENGE_MODES.CUSTOM && !customChallengeSystem.getActiveChallenge()) {
    UI.challengeResultCard.classList.add('hidden');
    return;
  }
  
  UI.challengeResultCard.classList.remove('hidden');
  
  if (!result) return;

  const { challenge, completed, failed, progress, alreadyCompleted, completedThisSession, failedReason } = result;

  UI.challengeResultIcon.textContent = challenge.icon;
  UI.challengeResultName.textContent = challenge.title;
  UI.challengeResultDesc.textContent = challenge.description;

  UI.challengeResultStatus.classList.remove('success', 'failed', 'already');
  UI.challengeResultProgressFill.classList.remove('success', 'failed');

  const modeLabel = activeChallengeMode === CHALLENGE_MODES.CUSTOM ? '自定义' : '今日';
  
  if (completedThisSession) {
    UI.challengeResultStatus.textContent = '🎉 挑战完成！';
    UI.challengeResultStatus.classList.add('success');
  } else if (failed) {
    UI.challengeResultStatus.textContent = failedReason || '挑战未完成';
    UI.challengeResultStatus.classList.add('failed');
  } else if (alreadyCompleted && !completed) {
    UI.challengeResultStatus.textContent = `${modeLabel}挑战已完成 ✓`;
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

function handleChallengeModeChange(mode) {
  activeChallengeMode = mode;
  game.setActiveChallengeMode(mode);
  
  UI.challengeModeTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.mode === mode);
  });
  
  UI.dailyChallengeCard.classList.toggle('hidden', mode !== CHALLENGE_MODES.DAILY);
  UI.customChallengeCard.classList.toggle('hidden', mode !== CHALLENGE_MODES.CUSTOM);
  
  if (mode === CHALLENGE_MODES.DAILY) {
    updateDailyChallengeCard();
  } else {
    updateCustomChallengeCard();
  }
  
  if (game.getState() === GAME_STATES.PLAYING) {
    showChallengeProgress();
  }
}

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
      updateCustomChallengeCard();
      hideChallengeProgress();
      break;
      
    case GAME_STATES.PLAYING:
      UI.pauseBtn.disabled = false;
      UI.restartBtn2.disabled = false;
      UI.pauseBtn.textContent = '暂停';
      if (previousState === GAME_STATES.IDLE || previousState === GAME_STATES.GAME_OVER) {
        achievementSystem.resetGameSession();
        dailyChallengeSystem.resetSessionProgress();
        customChallengeSystem.resetSessionProgress();
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
  
  if (game.replayManager && game.replayManager.hasLastRecording()) {
    UI.watchReplayBtn.style.display = 'inline-block';
  } else {
    UI.watchReplayBtn.style.display = 'none';
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
game.registerCustomChallengeSystem(customChallengeSystem);
game.registerStatsSystem(statsSystem);

achievementSystem.onUnlock(showAchievementToast);

dailyChallengeSystem.onCompletion((challenge) => {
  if (activeChallengeMode === CHALLENGE_MODES.DAILY) {
    showChallengeCompletionToast(challenge, '每日');
    updateDailyChallengeCard();
    updateChallengeProgress();
  }
});

customChallengeSystem.onCompletion((challenge) => {
  if (activeChallengeMode === CHALLENGE_MODES.CUSTOM) {
    showChallengeCompletionToast(challenge, '自定义');
    updateCustomChallengeCard();
    updateChallengeProgress();
  }
});

function showChallengeCompletionToast(challenge, mode = '每日') {
  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  const labelColor = mode === '自定义' ? '#fbbf24' : 'var(--accent-green)';
  toast.innerHTML = `
    <div class="achievement-toast-icon">${challenge.icon}</div>
    <div class="achievement-toast-content">
      <div class="achievement-toast-label" style="color: ${labelColor};">${mode}挑战完成</div>
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

let replayPlayer = null;
let currentPlaybackSpeed = 1;
const playbackSpeeds = [0.5, 1, 1.5, 2];

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateReplayLivesUI(lives) {
  const hearts = '❤️'.repeat(Math.max(0, lives));
  const empty = '🖤'.repeat(Math.max(0, CONFIG.game.initialLives - lives));
  return hearts + empty;
}

function openReplay() {
  if (!game.replayManager || !game.replayManager.hasLastRecording()) return;

  hideAllOverlays();

  replayPlayer = game.replayManager.startReplay(UI.canvas, game);
  if (!replayPlayer) return;

  game.isReplayMode = true;

  const recording = game.replayManager.getLastRecording();

  UI.replayFinalScore.textContent = recording.finalScore;
  UI.replayFinalLevel.textContent = recording.finalLevel;
  UI.replayDuration.textContent = formatTime(recording.duration);
  UI.replayTotalTime.textContent = formatTime(recording.duration);
  UI.replayCurrentTime.textContent = '00:00';
  UI.replayProgressFill.style.width = '0%';
  UI.replayCurrentScore.textContent = '0';
  UI.replayCurrentLives.textContent = updateReplayLivesUI(recording.initialState.player.lives);
  UI.replayCurrentLevel.textContent = '1';

  replayPlayer.onStateChange = handleReplayStateChange;
  replayPlayer.onProgressChange = handleReplayProgressChange;

  UI.replayPlayPauseBtn.textContent = '▶️ 播放';
  UI.replaySpeedBtn.textContent = `⏩ ${currentPlaybackSpeed}x`;

  UI.replayOverlay.classList.remove('hidden');
}

function closeReplay() {
  if (replayPlayer) {
    replayPlayer.stop();
  }
  game.replayManager.stopReplay();
  replayPlayer = null;
  game.isReplayMode = false;

  hideAllOverlays();
  UI.gameOverOverlay.classList.remove('hidden');
  updateHighScoreUI();
  game.renderIdle();
}

function handleReplayStateChange(state) {
  if (state === REPLAY_STATES.PLAYING) {
    UI.replayPlayPauseBtn.textContent = '⏸️ 暂停';
  } else {
    UI.replayPlayPauseBtn.textContent = '▶️ 播放';
  }
}

function handleReplayProgressChange(progress, currentTime, totalTime) {
  UI.replayProgressFill.style.width = `${progress * 100}%`;
  UI.replayCurrentTime.textContent = formatTime(currentTime);

  if (replayPlayer) {
    UI.replayCurrentScore.textContent = replayPlayer.getCurrentScore();
    UI.replayCurrentLives.textContent = updateReplayLivesUI(replayPlayer.getCurrentLives());
    UI.replayCurrentLevel.textContent = replayPlayer.getCurrentLevel();
  }
}

function handleReplaySeek(e) {
  if (!replayPlayer) return;

  const rect = UI.replayProgressBar.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const progress = Math.max(0, Math.min(1, clickX / rect.width));
  const targetTime = progress * replayPlayer.getDuration();
  replayPlayer.seekTo(targetTime);
}

function handleReplaySpeed() {
  const currentIndex = playbackSpeeds.indexOf(currentPlaybackSpeed);
  const nextIndex = (currentIndex + 1) % playbackSpeeds.length;
  currentPlaybackSpeed = playbackSpeeds[nextIndex];
  UI.replaySpeedBtn.textContent = `⏩ ${currentPlaybackSpeed}x`;

  if (replayPlayer) {
    replayPlayer.setPlaybackSpeed(currentPlaybackSpeed);
  }
}

function backToGameOver() {
  closeReplay();
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

UI.watchReplayBtn.addEventListener('click', openReplay);
UI.replayPlayPauseBtn.addEventListener('click', () => {
  if (replayPlayer) {
    replayPlayer.togglePlayPause();
  }
});
UI.replayRestartBtn.addEventListener('click', () => {
  if (replayPlayer) {
    replayPlayer.replay();
  }
});
UI.replaySpeedBtn.addEventListener('click', handleReplaySpeed);
UI.replayExitBtn.addEventListener('click', closeReplay);
UI.replayBackBtn.addEventListener('click', backToGameOver);
UI.replayProgressBar.addEventListener('click', handleReplaySeek);

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
  
  if (!game.isReplayMode && (game.getState() === GAME_STATES.IDLE || game.getState() === GAME_STATES.GAME_OVER)) {
    game.renderIdle();
  }
  
  if (game.getState() === GAME_STATES.PLAYING && now - lastChallengeCheck > 500) {
    getActiveChallengeSystem().checkCompletion();
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

function openCustomChallenges() {
  hideAllOverlays();
  renderCustomChallengesList();
  UI.customChallengesOverlay.classList.remove('hidden');
}

function closeCustomChallenges() {
  UI.customChallengesOverlay.classList.add('hidden');
  UI.startOverlay.classList.remove('hidden');
}

function renderCustomChallengesList() {
  const challenges = customChallengeSystem.getAllChallenges();
  const activeId = customChallengeSystem.activeChallengeId;

  if (challenges.length === 0) {
    UI.customChallengesList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎮</div>
        <div class="empty-state-text">暂无自定义挑战</div>
        <div class="empty-state-desc">点击下方按钮创建你的第一个挑战</div>
      </div>
    `;
    return;
  }

  UI.customChallengesList.innerHTML = challenges.map(challenge => {
    const isActive = challenge.id === activeId;
    const isCompleted = challenge.completed;
    const bestProgress = Math.round(challenge.bestProgress || 0);

    return `
      <div class="custom-challenge-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" data-id="${challenge.id}">
        <div class="custom-challenge-icon">${challenge.icon}</div>
        <div class="custom-challenge-info">
          <div class="custom-challenge-title">${challenge.title}</div>
          <div class="custom-challenge-desc">${challenge.description}</div>
          <div class="custom-challenge-meta">
            <span class="custom-challenge-progress">最佳: ${bestProgress}%</span>
            ${isCompleted ? '<span class="custom-challenge-badge">✓ 已完成</span>' : ''}
          </div>
        </div>
        <div class="custom-challenge-actions">
          <button class="btn btn-small ${isActive ? 'btn-primary' : 'btn-secondary'}" data-action="select" data-id="${challenge.id}">
            ${isActive ? '已选择' : '选择'}
          </button>
          <button class="btn btn-small btn-warning" data-action="reset" data-id="${challenge.id}" title="重置进度">
            🔄
          </button>
          <button class="btn btn-small btn-danger" data-action="delete" data-id="${challenge.id}" title="删除">
            🗑️
          </button>
        </div>
      </div>
    `;
  }).join('');

  UI.customChallengesList.querySelectorAll('.custom-challenge-item').forEach(item => {
    const id = item.dataset.id;
    
    item.querySelector('[data-action="select"]').addEventListener('click', (e) => {
      e.stopPropagation();
      if (customChallengeSystem.selectChallenge(id)) {
        handleChallengeModeChange(CHALLENGE_MODES.CUSTOM);
        renderCustomChallengesList();
      }
    });

    item.querySelector('[data-action="reset"]').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('确定要重置这个挑战的进度吗？')) {
        customChallengeSystem.resetChallengeProgress(id);
        renderCustomChallengesList();
        updateCustomChallengeCard();
      }
    });

    item.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('确定要删除这个挑战吗？此操作不可撤销。')) {
        customChallengeSystem.deleteChallenge(id);
        renderCustomChallengesList();
        updateCustomChallengeCard();
      }
    });
  });
}

let currentCreateForm = {
  type: null,
  target: 50,
  constraint: 1,
  icon: '🎯',
  color: '#6366f1',
  title: ''
};

function openCreateChallenge() {
  const templates = customChallengeSystem.getChallengeTemplates();
  
  UI.challengeTypeSelect.innerHTML = templates.map((t, index) => {
    const typeLabels = {
      score_time: '⏱️ 限时得分',
      no_damage_stars: '🛡️ 无伤收集星星',
      heal_survive: '❤️ 回血生存',
      survive_to_level: '🏃 存活到指定等级',
      must_use_heal: '💖 必须使用回血'
    };
    return `<option value="${t.type}" data-index="${index}">${typeLabels[t.type] || t.type}</option>`;
  }).join('');

  currentCreateForm.type = templates[0].type;
  updateCreateFormUI();
  
  hideAllOverlays();
  UI.createChallengeOverlay.classList.remove('hidden');
}

function closeCreateChallenge() {
  UI.createChallengeOverlay.classList.add('hidden');
  UI.customChallengesOverlay.classList.remove('hidden');
}

function updateCreateFormUI() {
  const templates = customChallengeSystem.getChallengeTemplates();
  const template = templates.find(t => t.type === currentCreateForm.type);
  
  if (!template) return;

  UI.targetRange.min = template.targetRange[0];
  UI.targetRange.max = template.targetRange[1];
  UI.targetRange.value = Math.min(Math.max(currentCreateForm.target, template.targetRange[0]), template.targetRange[1]);
  currentCreateForm.target = parseInt(UI.targetRange.value);
  UI.targetRangeValue.textContent = currentCreateForm.target;

  const targetLabels = {
    score_time: '目标分数',
    no_damage_stars: '收集星星数量',
    heal_survive: '目标等级',
    survive_to_level: '目标等级',
    must_use_heal: '目标等级'
  };
  UI.targetLabel.textContent = targetLabels[currentCreateForm.type] || '目标值';

  if (template.constraintRange[0] === template.constraintRange[1]) {
    UI.constraintGroup.classList.add('hidden');
    currentCreateForm.constraint = template.constraintRange[0];
  } else {
    UI.constraintGroup.classList.remove('hidden');
    UI.constraintRange.min = template.constraintRange[0];
    UI.constraintRange.max = template.constraintRange[1];
    UI.constraintRange.value = Math.min(Math.max(currentCreateForm.constraint, template.constraintRange[0]), template.constraintRange[1]);
    currentCreateForm.constraint = parseInt(UI.constraintRange.value);
    UI.constraintRangeValue.textContent = currentCreateForm.constraint;

    const constraintLabels = {
      score_time: '时间限制（秒）',
      no_damage_stars: '约束值',
      heal_survive: '使用回血次数',
      must_use_heal: '使用回血次数'
    };
    UI.constraintLabel.textContent = constraintLabels[currentCreateForm.type] || '约束值';
  }

  UI.iconSelector.innerHTML = template.icons.map(icon => `
    <button class="icon-btn ${currentCreateForm.icon === icon ? 'selected' : ''}" data-icon="${icon}">${icon}</button>
  `).join('');

  UI.iconSelector.querySelectorAll('.icon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCreateForm.icon = btn.dataset.icon;
      updateCreateFormUI();
    });
  });

  UI.colorSelector.innerHTML = template.colors.map(color => `
    <button class="color-btn ${currentCreateForm.color === color ? 'selected' : ''}" data-color="${color}" style="background-color: ${color};"></button>
  `).join('');

  UI.colorSelector.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCreateForm.color = btn.dataset.color;
      updateCreateFormUI();
    });
  });

  if (!currentCreateForm.title) {
    currentCreateForm.title = template.titles[0];
  }
  UI.challengeTitleInput.placeholder = `默认: ${template.titles[0]}`;

  updateChallengePreview();
}

function updateChallengePreview() {
  const templates = customChallengeSystem.getChallengeTemplates();
  const template = templates.find(t => t.type === currentCreateForm.type);
  
  if (!template) return;

  const description = template.descriptions[0]
    .replace('{target}', currentCreateForm.target)
    .replace('{constraint}', currentCreateForm.constraint);

  UI.challengePreviewIcon.textContent = currentCreateForm.icon;
  UI.challengePreviewTitle.textContent = currentCreateForm.title || template.titles[0];
  UI.challengePreviewDesc.textContent = description;
}

function confirmCreateChallenge() {
  const templates = customChallengeSystem.getChallengeTemplates();
  const template = templates.find(t => t.type === currentCreateForm.type);
  
  if (!template) return;

  const title = currentCreateForm.title.trim() || template.titles[0];

  const challenge = customChallengeSystem.createChallenge({
    type: currentCreateForm.type,
    target: currentCreateForm.target,
    constraint: currentCreateForm.constraint,
    icon: currentCreateForm.icon,
    color: currentCreateForm.color,
    title: title
  });

  if (challenge) {
    customChallengeSystem.selectChallenge(challenge.id);
    handleChallengeModeChange(CHALLENGE_MODES.CUSTOM);
    closeCreateChallenge();
    renderCustomChallengesList();
  }
}

UI.challengeModeTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const mode = tab.dataset.mode;
    handleChallengeModeChange(mode);
  });
});

UI.manageCustomChallengesBtn.addEventListener('click', openCustomChallenges);
UI.customChallengesCloseBtn.addEventListener('click', closeCustomChallenges);
UI.customChallengesBackBtn.addEventListener('click', closeCustomChallenges);

UI.createChallengeBtn.addEventListener('click', openCreateChallenge);
UI.createChallengeCloseBtn.addEventListener('click', closeCreateChallenge);
UI.cancelCreateChallengeBtn.addEventListener('click', closeCreateChallenge);
UI.confirmCreateChallengeBtn.addEventListener('click', confirmCreateChallenge);

UI.challengeTypeSelect.addEventListener('change', (e) => {
  currentCreateForm.type = e.target.value;
  currentCreateForm.title = '';
  const templates = customChallengeSystem.getChallengeTemplates();
  const template = templates.find(t => t.type === currentCreateForm.type);
  if (template) {
    currentCreateForm.icon = template.icons[0];
    currentCreateForm.color = template.colors[0];
    currentCreateForm.target = Math.floor((template.targetRange[0] + template.targetRange[1]) / 2);
    currentCreateForm.constraint = Math.floor((template.constraintRange[0] + template.constraintRange[1]) / 2);
  }
  updateCreateFormUI();
});

UI.targetRange.addEventListener('input', (e) => {
  currentCreateForm.target = parseInt(e.target.value);
  UI.targetRangeValue.textContent = currentCreateForm.target;
  updateChallengePreview();
});

UI.constraintRange.addEventListener('input', (e) => {
  currentCreateForm.constraint = parseInt(e.target.value);
  UI.constraintRangeValue.textContent = currentCreateForm.constraint;
  updateChallengePreview();
});

UI.challengeTitleInput.addEventListener('input', (e) => {
  currentCreateForm.title = e.target.value;
  updateChallengePreview();
});

UI.customChallengesOverlay.addEventListener('click', (e) => {
  if (e.target === UI.customChallengesOverlay) {
    closeCustomChallenges();
  }
});

UI.createChallengeOverlay.addEventListener('click', (e) => {
  if (e.target === UI.createChallengeOverlay) {
    closeCreateChallenge();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!UI.customChallengesOverlay.classList.contains('hidden')) {
      closeCustomChallenges();
    } else if (!UI.createChallengeOverlay.classList.contains('hidden')) {
      closeCreateChallenge();
    }
  }
});
