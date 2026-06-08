import { CONFIG } from './config.js';
import { CHALLENGE_TYPES, CHALLENGE_TEMPLATES } from './dailyChallenge.js';

export const CHALLENGE_MODES = {
  NONE: 'none',
  DAILY: 'daily',
  CUSTOM: 'custom'
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function getTemplateByType(type) {
  return CHALLENGE_TEMPLATES.find(t => t.type === type);
}

function buildDescription(template, target, constraint) {
  const descriptionTemplate = template.descriptions[0];
  return descriptionTemplate
    .replace('{target}', target)
    .replace('{constraint}', constraint);
}

export class CustomChallengeSystem {
  constructor(storage) {
    this.storage = storage;
    this.challenges = this.loadChallenges();
    this.activeChallengeId = null;
    this.activeChallenge = null;
    this.sessionProgress = null;
    this.completionCallbacks = [];
    this.game = null;
  }

  loadChallenges() {
    return this.storage.get(CONFIG.storage.customChallengesKey, []);
  }

  saveChallenges() {
    this.storage.set(CONFIG.storage.customChallengesKey, this.challenges);
  }

  getAllChallenges() {
    return [...this.challenges];
  }

  getChallengeById(id) {
    return this.challenges.find(c => c.id === id);
  }

  createChallenge(challengeData) {
    const template = getTemplateByType(challengeData.type);
    if (!template) return null;

    const target = Math.max(
      template.targetRange[0],
      Math.min(template.targetRange[1], challengeData.target)
    );
    const constraint = template.constraintRange[0] === template.constraintRange[1]
      ? template.constraintRange[0]
      : Math.max(
          template.constraintRange[0],
          Math.min(template.constraintRange[1], challengeData.constraint)
        );

    const challenge = {
      id: generateId(),
      type: challengeData.type,
      title: challengeData.title || template.titles[0],
      description: buildDescription(template, target, constraint),
      target,
      constraint,
      icon: challengeData.icon || template.icons[0],
      color: challengeData.color || template.colors[0],
      createdAt: Date.now(),
      completed: false,
      completedAt: null,
      bestProgress: 0
    };

    this.challenges.push(challenge);
    this.saveChallenges();
    return challenge;
  }

  deleteChallenge(id) {
    const index = this.challenges.findIndex(c => c.id === id);
    if (index !== -1) {
      if (this.activeChallengeId === id) {
        this.clearActiveChallenge();
      }
      this.challenges.splice(index, 1);
      this.saveChallenges();
      return true;
    }
    return false;
  }

  resetChallengeProgress(id) {
    const challenge = this.getChallengeById(id);
    if (challenge) {
      challenge.completed = false;
      challenge.completedAt = null;
      challenge.bestProgress = 0;
      this.saveChallenges();
      return true;
    }
    return false;
  }

  selectChallenge(id) {
    const challenge = this.getChallengeById(id);
    if (challenge) {
      this.activeChallengeId = id;
      this.activeChallenge = { ...challenge };
      this.resetSessionProgress();
      return true;
    }
    return false;
  }

  clearActiveChallenge() {
    this.activeChallengeId = null;
    this.activeChallenge = null;
    this.sessionProgress = null;
  }

  getActiveChallenge() {
    return this.activeChallenge ? { ...this.activeChallenge } : null;
  }

  isActiveChallengeCompleted() {
    if (!this.activeChallenge) return false;
    const challenge = this.getChallengeById(this.activeChallengeId);
    return challenge ? challenge.completed : false;
  }

  resetSessionProgress() {
    this.sessionProgress = {
      score: 0,
      starsCollected: 0,
      damageTaken: 0,
      healUsed: 0,
      startTime: Date.now(),
      survivedToLevel: 1,
      completed: false,
      completedAt: null,
      failed: false
    };
  }

  notify(event, value) {
    if (!this.sessionProgress || !this.activeChallenge || 
        this.sessionProgress.completed || this.sessionProgress.failed) {
      return;
    }

    switch (event) {
      case 'score':
        this.sessionProgress.score = value;
        break;
      case 'star_collected':
        this.sessionProgress.starsCollected += value;
        break;
      case 'damage_taken':
        this.sessionProgress.damageTaken += value;
        break;
      case 'heal_used':
        this.sessionProgress.healUsed += value;
        break;
      case 'level_up':
        this.sessionProgress.survivedToLevel = value;
        break;
      case 'game_over':
        this.sessionProgress.survivedToLevel = value;
        break;
    }

    this.checkCompletion();
  }

  checkCompletion() {
    if (!this.activeChallenge || this.sessionProgress.completed) return false;

    const challenge = this.activeChallenge;
    const progress = this.sessionProgress;
    let completed = false;
    let failed = false;

    switch (challenge.type) {
      case CHALLENGE_TYPES.SCORE_TIME:
        const elapsed = (Date.now() - progress.startTime) / 1000;
        if (progress.score >= challenge.target) {
          completed = true;
        } else if (elapsed >= challenge.constraint) {
          failed = true;
        }
        break;

      case CHALLENGE_TYPES.NO_DAMAGE_STARS:
        if (progress.starsCollected >= challenge.target && progress.damageTaken === 0) {
          completed = true;
        } else if (progress.damageTaken > 0) {
          failed = true;
        }
        break;

      case CHALLENGE_TYPES.HEAL_SURVIVE:
        if (progress.survivedToLevel >= challenge.target && progress.healUsed >= challenge.constraint) {
          completed = true;
        }
        break;

      case CHALLENGE_TYPES.SURVIVE_TO_LEVEL:
        if (progress.survivedToLevel >= challenge.target) {
          completed = true;
        }
        break;

      case CHALLENGE_TYPES.MUST_USE_HEAL:
        if (progress.survivedToLevel >= challenge.target && progress.healUsed >= challenge.constraint) {
          completed = true;
        }
        break;
    }

    if (completed) {
      this.sessionProgress.completed = true;
      this.sessionProgress.completedAt = Date.now();
      this.completeChallenge();
      return true;
    }

    if (failed) {
      this.sessionProgress.failed = true;
    }

    const currentResult = this.getSessionResult();
    if (currentResult && this.activeChallengeId) {
      const challengeRecord = this.getChallengeById(this.activeChallengeId);
      if (challengeRecord && currentResult.progress > challengeRecord.bestProgress) {
        challengeRecord.bestProgress = currentResult.progress;
        this.saveChallenges();
      }
    }

    return false;
  }

  completeChallenge() {
    if (!this.activeChallengeId) return;

    const challenge = this.getChallengeById(this.activeChallengeId);
    if (challenge && !challenge.completed) {
      challenge.completed = true;
      challenge.completedAt = Date.now();
      challenge.bestProgress = 100;
      this.saveChallenges();
      this.notifyCompletion(this.activeChallenge);
    }
  }

  notifyCompletion(challenge) {
    this.completionCallbacks.forEach(cb => {
      try {
        cb(challenge);
      } catch (e) {
        console.error('自定义挑战完成回调出错:', e);
      }
    });
  }

  onCompletion(callback) {
    if (typeof callback === 'function') {
      this.completionCallbacks.push(callback);
    }
  }

  getSessionResult() {
    if (!this.activeChallenge || !this.sessionProgress) {
      return null;
    }

    const progress = this.sessionProgress;
    let currentProgress = 0;
    let failedReason = null;

    switch (this.activeChallenge.type) {
      case CHALLENGE_TYPES.SCORE_TIME:
        currentProgress = Math.min(100, (progress.score / this.activeChallenge.target) * 100);
        if (progress.failed) {
          const elapsed = Math.floor((Date.now() - progress.startTime) / 1000);
          failedReason = `时间到！用时${elapsed}秒，得分${progress.score}分`;
        }
        break;

      case CHALLENGE_TYPES.NO_DAMAGE_STARS:
        currentProgress = Math.min(100, (progress.starsCollected / this.activeChallenge.target) * 100);
        if (progress.failed) {
          failedReason = '受到了伤害，挑战失败';
        }
        break;

      case CHALLENGE_TYPES.HEAL_SURVIVE:
        const levelProgress = progress.survivedToLevel / this.activeChallenge.target;
        const healProgress = this.activeChallenge.constraint > 0 
          ? progress.healUsed / this.activeChallenge.constraint 
          : 1;
        currentProgress = Math.min(100, Math.min(levelProgress, healProgress) * 100);
        break;

      case CHALLENGE_TYPES.SURVIVE_TO_LEVEL:
        currentProgress = Math.min(100, (progress.survivedToLevel / this.activeChallenge.target) * 100);
        break;

      case CHALLENGE_TYPES.MUST_USE_HEAL:
        const surviveProgress = progress.survivedToLevel / this.activeChallenge.target;
        const mustHealProgress = this.activeChallenge.constraint > 0 
          ? progress.healUsed / this.activeChallenge.constraint 
          : 1;
        currentProgress = Math.min(100, Math.min(surviveProgress, mustHealProgress) * 100);
        break;
    }

    const completedThisSession = progress.completed && progress.completedAt &&
      progress.completedAt >= progress.startTime;

    const challengeRecord = this.getChallengeById(this.activeChallengeId);
    const alreadyCompleted = challengeRecord ? challengeRecord.completed : false;

    return {
      challenge: { ...this.activeChallenge },
      completed: progress.completed,
      failed: progress.failed,
      progress: currentProgress,
      alreadyCompleted: alreadyCompleted,
      completedThisSession: completedThisSession,
      failedReason
    };
  }

  getProgressDisplay() {
    if (!this.activeChallenge || !this.sessionProgress) {
      return null;
    }

    const progress = this.sessionProgress;
    let value = 0;
    let total = this.activeChallenge.target;
    let label = '';

    switch (this.activeChallenge.type) {
      case CHALLENGE_TYPES.SCORE_TIME:
        value = progress.score;
        label = '得分';
        break;

      case CHALLENGE_TYPES.NO_DAMAGE_STARS:
        value = progress.starsCollected;
        label = '星星';
        break;

      case CHALLENGE_TYPES.HEAL_SURVIVE:
        value = progress.survivedToLevel;
        label = '等级';
        break;

      case CHALLENGE_TYPES.SURVIVE_TO_LEVEL:
        value = progress.survivedToLevel;
        label = '等级';
        break;

      case CHALLENGE_TYPES.MUST_USE_HEAL:
        value = progress.healUsed;
        total = this.activeChallenge.constraint;
        label = '回血使用';
        break;
    }

    return { value, total, label };
  }

  getChallengeTemplates() {
    return CHALLENGE_TEMPLATES.map(t => ({
      type: t.type,
      titles: t.titles,
      descriptions: t.descriptions,
      icons: t.icons,
      colors: t.colors,
      targetRange: t.targetRange,
      constraintRange: t.constraintRange
    }));
  }

  onRegister(game) {
    this.game = game;
  }
}
