import { CONFIG, GAME_STATES } from './config.js';

export const ACHIEVEMENTS = [
  {
    id: 'first_star',
    name: '初次收获',
    description: '首次收集一颗星星',
    icon: '⭐',
    color: '#fbbf24',
    condition: (state, events) => events.starCollected >= 1
  },
  {
    id: 'score_100',
    name: '百分达人',
    description: '单局游戏达到100分',
    icon: '💯',
    color: '#10b981',
    condition: (state, events) => state.currentScore >= 100
  },
  {
    id: 'no_damage_50',
    name: '完美躲避',
    description: '无伤状态下达到50分',
    icon: '🛡️',
    color: '#3b82f6',
    condition: (state, events) => state.currentScore >= 50 && events.damageTaken === 0
  },
  {
    id: 'new_high_score',
    name: '纪录打破者',
    description: '刷新个人最高分',
    icon: '🏆',
    color: '#f59e0b',
    condition: (state, events) => events.highScoreBroken === true
  }
];

export class AchievementSystem {
  constructor(storage) {
    this.storage = storage;
    this.achievements = ACHIEVEMENTS;
    this.unlocked = this.loadUnlocked();
    this.unlockCallbacks = [];
    
    this.resetSessionState();
  }

  loadUnlocked() {
    return this.storage.get(CONFIG.storage.achievementsKey, {});
  }

  saveUnlocked() {
    this.storage.set(CONFIG.storage.achievementsKey, this.unlocked);
  }

  resetSessionState() {
    this.sessionState = {
      currentScore: 0,
      currentLives: 3,
      isPlaying: false
    };
    
    this.sessionEvents = {
      starCollected: 0,
      damageTaken: 0,
      highScoreBroken: false
    };
  }

  onRegister(game) {
    this.game = game;
  }

  onUnlock(callback) {
    if (typeof callback === 'function') {
      this.unlockCallbacks.push(callback);
    }
  }

  notify(event, value) {
    switch (event) {
      case 'star_collected':
        this.sessionEvents.starCollected++;
        break;
      case 'damage_taken':
        this.sessionEvents.damageTaken += value;
        break;
      case 'high_score_broken':
        this.sessionEvents.highScoreBroken = true;
        break;
    }
  }

  check(game) {
    if (!game) return;
    
    const state = game.getState();
    if (state !== GAME_STATES.PLAYING && state !== GAME_STATES.GAME_OVER) return;

    this.sessionState.currentScore = game.getScore();
    this.sessionState.currentLives = game.getLives();
    this.sessionState.isPlaying = state === GAME_STATES.PLAYING;

    for (const achievement of this.achievements) {
      if (this.isUnlocked(achievement.id)) continue;

      try {
        if (achievement.condition(this.sessionState, this.sessionEvents)) {
          this.unlock(achievement);
        }
      } catch (e) {
        console.error('成就检查出错:', achievement.id, e);
      }
    }
  }

  unlock(achievement) {
    if (this.isUnlocked(achievement.id)) return;

    const unlockData = {
      unlockedAt: Date.now(),
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      color: achievement.color
    };

    this.unlocked[achievement.id] = unlockData;
    this.saveUnlocked();
    this.notifyUnlock(achievement, unlockData);
  }

  notifyUnlock(achievement, unlockData) {
    this.unlockCallbacks.forEach(cb => {
      try {
        cb(achievement, unlockData);
      } catch (e) {
        console.error('成就解锁回调出错:', e);
      }
    });
  }

  isUnlocked(achievementId) {
    return !!this.unlocked[achievementId];
  }

  getUnlocked() {
    return { ...this.unlocked };
  }

  getAllAchievements() {
    return this.achievements.map(a => ({
      ...a,
      unlocked: this.isUnlocked(a.id),
      unlockedAt: this.unlocked[a.id]?.unlockedAt || null
    }));
  }

  getUnlockedCount() {
    return Object.keys(this.unlocked).length;
  }

  getTotalCount() {
    return this.achievements.length;
  }

  resetGameSession() {
    this.resetSessionState();
  }
}
