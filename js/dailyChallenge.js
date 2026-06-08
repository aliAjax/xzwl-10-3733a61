import { CONFIG } from './config.js';

const CHALLENGE_TYPES = {
  SCORE_TIME: 'score_time',
  NO_DAMAGE_STARS: 'no_damage_stars',
  HEAL_SURVIVE: 'heal_survive'
};

const CHALLENGE_TEMPLATES = [
  {
    type: CHALLENGE_TYPES.SCORE_TIME,
    titles: ['速战速决', '闪电战', '时间赛跑', '竞速挑战', '分秒必争'],
    descriptions: [
      '在{constraint}秒内达到{target}分',
      '{constraint}秒限时挑战：收集{target}分',
      '时间紧迫！{constraint}秒内获得{target}分'
    ],
    icons: ['⏱️', '⚡', '🏃', '🚀', '💨'],
    colors: ['#f59e0b', '#ef4444', '#f97316', '#eab308', '#ec4899'],
    targetRange: [100, 400],
    constraintRange: [45, 90]
  },
  {
    type: CHALLENGE_TYPES.NO_DAMAGE_STARS,
    titles: ['完美闪避', '无伤大师', '毫发无损', '优雅收集', '零失误'],
    descriptions: [
      '无伤状态下收集{target}颗星星',
      '不受任何伤害收集{target}颗星星',
      '保持完美状态，收集{target}颗星星'
    ],
    icons: ['🛡️', '💎', '✨', '🎯', '👑'],
    colors: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#14b8a6'],
    targetRange: [10, 40],
    constraintRange: [0, 0]
  },
  {
    type: CHALLENGE_TYPES.HEAL_SURVIVE,
    titles: ['生存专家', '坚韧不拔', '回血战士', '不屈不挠', '续命达人'],
    descriptions: [
      '只靠道具回血，坚持到第{target}等级',
      '使用回血道具存活至{target}级',
      '在道具帮助下生存到{target}级'
    ],
    icons: ['❤️', '💪', '🌟', '🔥', '🏆'],
    colors: ['#ef4444', '#ec4899', '#f97316', '#eab308', '#8b5cf6'],
    targetRange: [3, 7],
    constraintRange: [1, 3]
  }
];

class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick(array) {
    return array[this.nextInt(0, array.length - 1)];
  }
}

function getDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateSeed(dateStr) {
  let seed = 2166136261;
  const fnvPrime = 16777619;
  for (let i = 0; i < dateStr.length; i++) {
    seed ^= dateStr.charCodeAt(i);
    seed = Math.imul(seed, fnvPrime);
  }
  seed ^= seed >>> 16;
  seed = Math.imul(seed, 2246822507);
  seed ^= seed >>> 13;
  seed = Math.imul(seed, 3266489909);
  seed ^= seed >>> 16;
  return Math.abs(seed) % 2147483647;
}

export class DailyChallengeSystem {
  constructor(storage) {
    this.storage = storage;
    this.currentChallenge = null;
    this.todayStr = getDateString();
    this.sessionProgress = null;
    this.completedChallenges = this.loadCompleted();
    this.completionCallbacks = [];

    this.generateTodayChallenge();
  }

  loadCompleted() {
    return this.storage.get(CONFIG.storage.dailyChallengesKey, {});
  }

  saveCompleted() {
    this.storage.set(CONFIG.storage.dailyChallengesKey, this.completedChallenges);
  }

  generateTodayChallenge() {
    const seed = getDateSeed(this.todayStr);
    const rng = new SeededRandom(seed);

    const templateIndex = rng.nextInt(0, CHALLENGE_TEMPLATES.length - 1);
    const template = CHALLENGE_TEMPLATES[templateIndex];

    const target = rng.nextInt(template.targetRange[0], template.targetRange[1]);
    let constraint = 0;
    if (template.constraintRange[0] !== template.constraintRange[1]) {
      constraint = rng.nextInt(template.constraintRange[0], template.constraintRange[1]);
    }

    const title = rng.pick(template.titles);
    const descriptionTemplate = rng.pick(template.descriptions);
    const icon = rng.pick(template.icons);
    const color = rng.pick(template.colors);

    const description = descriptionTemplate
      .replace('{target}', target)
      .replace('{constraint}', constraint);

    this.currentChallenge = {
      date: this.todayStr,
      type: template.type,
      title,
      description,
      target,
      constraint,
      icon,
      color
    };

    return this.currentChallenge;
  }

  getTodayChallenge() {
    const nowStr = getDateString();
    if (nowStr !== this.todayStr) {
      this.todayStr = nowStr;
      this.generateTodayChallenge();
    }
    return { ...this.currentChallenge };
  }

  isTodayCompleted() {
    return !!this.completedChallenges[this.todayStr];
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
    if (!this.sessionProgress || this.sessionProgress.completed || this.sessionProgress.failed) {
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
    if (!this.currentChallenge || this.sessionProgress.completed) return false;

    const challenge = this.currentChallenge;
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

    return false;
  }

  completeChallenge() {
    if (!this.completedChallenges[this.todayStr]) {
      this.completedChallenges[this.todayStr] = {
        completedAt: Date.now(),
        challenge: { ...this.currentChallenge }
      };
      this.saveCompleted();
      this.notifyCompletion(this.currentChallenge);
    }
  }

  notifyCompletion(challenge) {
    this.completionCallbacks.forEach(cb => {
      try {
        cb(challenge);
      } catch (e) {
        console.error('挑战完成回调出错:', e);
      }
    });
  }

  onCompletion(callback) {
    if (typeof callback === 'function') {
      this.completionCallbacks.push(callback);
    }
  }

  getSessionResult() {
    if (!this.currentChallenge || !this.sessionProgress) {
      return null;
    }

    const progress = this.sessionProgress;
    let currentProgress = 0;
    let failedReason = null;

    switch (this.currentChallenge.type) {
      case CHALLENGE_TYPES.SCORE_TIME:
        currentProgress = Math.min(100, (progress.score / this.currentChallenge.target) * 100);
        if (progress.failed) {
          const elapsed = Math.floor((Date.now() - progress.startTime) / 1000);
          failedReason = `时间到！用时${elapsed}秒，得分${progress.score}分`;
        }
        break;

      case CHALLENGE_TYPES.NO_DAMAGE_STARS:
        currentProgress = Math.min(100, (progress.starsCollected / this.currentChallenge.target) * 100);
        if (progress.failed) {
          failedReason = '受到了伤害，挑战失败';
        }
        break;

      case CHALLENGE_TYPES.HEAL_SURVIVE:
        const levelProgress = progress.survivedToLevel / this.currentChallenge.target;
        const healProgress = this.currentChallenge.constraint > 0 
          ? progress.healUsed / this.currentChallenge.constraint 
          : 1;
        currentProgress = Math.min(100, Math.min(levelProgress, healProgress) * 100);
        break;
    }

    const completedThisSession = progress.completed && progress.completedAt &&
      progress.completedAt >= progress.startTime;

    return {
      challenge: { ...this.currentChallenge },
      completed: progress.completed,
      failed: progress.failed,
      progress: currentProgress,
      alreadyCompletedToday: this.isTodayCompleted(),
      completedThisSession: completedThisSession,
      failedReason
    };
  }

  getProgressDisplay() {
    if (!this.currentChallenge || !this.sessionProgress) {
      return null;
    }

    const progress = this.sessionProgress;
    let value = 0;
    let total = this.currentChallenge.target;
    let label = '';

    switch (this.currentChallenge.type) {
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
    }

    return { value, total, label };
  }

  onRegister(game) {
    this.game = game;
  }
}
