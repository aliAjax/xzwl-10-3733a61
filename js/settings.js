export const SETTINGS_KEY = 'starCollector_settings';

export const DEFAULT_SETTINGS = {
  soundEnabled: true,
  speedLevel: 'normal',
  touchMode: 'auto'
};

export const SPEED_LEVELS = {
  slow: { label: '慢', multiplier: 0.7 },
  normal: { label: '中', multiplier: 1.0 },
  fast: { label: '快', multiplier: 1.5 }
};

export const TOUCH_MODES = {
  auto: { label: '自动', cssClass: '' },
  always: { label: '始终显示', cssClass: 'visible-always' },
  hide: { label: '隐藏', cssClass: 'hidden-always' }
};

export class SettingsManager {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.settings = { ...DEFAULT_SETTINGS };
    this.changeCallbacks = [];
    this.load();
  }

  load() {
    try {
      const saved = this.storageManager.get(SETTINGS_KEY, null);
      if (saved) {
        this.settings = { ...DEFAULT_SETTINGS, ...saved };
      }
    } catch (e) {
      console.warn('加载设置失败，使用默认设置:', e);
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  save() {
    try {
      this.storageManager.set(SETTINGS_KEY, this.settings);
      return true;
    } catch (e) {
      console.warn('保存设置失败:', e);
      return false;
    }
  }

  getSettings() {
    return { ...this.settings };
  }

  get(key) {
    return this.settings[key];
  }

  set(key, value) {
    if (this.settings[key] === value) return;
    
    const oldValue = this.settings[key];
    this.settings[key] = value;
    this.save();
    this.notifyChange(key, value, oldValue);
  }

  setSoundEnabled(enabled) {
    this.set('soundEnabled', enabled);
  }

  setSpeedLevel(level) {
    if (SPEED_LEVELS[level]) {
      this.set('speedLevel', level);
    }
  }

  setTouchMode(mode) {
    if (TOUCH_MODES[mode]) {
      this.set('touchMode', mode);
    }
  }

  getSpeedMultiplier() {
    return SPEED_LEVELS[this.settings.speedLevel]?.multiplier ?? 1.0;
  }

  getTouchCssClass() {
    return TOUCH_MODES[this.settings.touchMode]?.cssClass ?? '';
  }

  reset() {
    const oldSettings = { ...this.settings };
    this.settings = { ...DEFAULT_SETTINGS };
    this.save();
    
    Object.keys(DEFAULT_SETTINGS).forEach(key => {
      if (oldSettings[key] !== this.settings[key]) {
        this.notifyChange(key, this.settings[key], oldSettings[key]);
      }
    });
  }

  onChange(callback) {
    if (typeof callback === 'function') {
      this.changeCallbacks.push(callback);
    }
  }

  notifyChange(key, newValue, oldValue) {
    this.changeCallbacks.forEach(cb => {
      try {
        cb(key, newValue, oldValue);
      } catch (e) {
        console.error('设置变更回调执行失败:', e);
      }
    });
  }
}
