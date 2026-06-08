export class InputManager {
  constructor() {
    this.keys = {};
    this.touchDirection = { x: 0, y: 0 };
    this.keyDownCallbacks = [];
    this.keyUpCallbacks = [];
    this.touchControlsEl = null;
    this.init();
  }

  init() {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    const touchBtns = document.querySelectorAll('.touch-btn');
    touchBtns.forEach(btn => {
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.handleTouchStart(btn.dataset.direction);
      });
      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.handleTouchEnd(btn.dataset.direction);
      });
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.handleTouchStart(btn.dataset.direction);
      });
      btn.addEventListener('mouseup', (e) => {
        e.preventDefault();
        this.handleTouchEnd(btn.dataset.direction);
      });
      btn.addEventListener('mouseleave', (e) => {
        e.preventDefault();
        this.handleTouchEnd(btn.dataset.direction);
      });
    });
  }

  handleKeyDown(e) {
    const key = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(key)) {
      e.preventDefault();
    }
    if (!this.keys[key]) {
      this.keys[key] = true;
      this.keyDownCallbacks.forEach(cb => cb(key));
    }
  }

  handleKeyUp(e) {
    const key = e.key.toLowerCase();
    this.keys[key] = false;
    this.keyUpCallbacks.forEach(cb => cb(key));
  }

  handleTouchStart(direction) {
    switch (direction) {
      case 'up': this.touchDirection.y = -1; break;
      case 'down': this.touchDirection.y = 1; break;
      case 'left': this.touchDirection.x = -1; break;
      case 'right': this.touchDirection.x = 1; break;
    }
  }

  handleTouchEnd(direction) {
    switch (direction) {
      case 'up':
      case 'down': this.touchDirection.y = 0; break;
      case 'left':
      case 'right': this.touchDirection.x = 0; break;
    }
  }

  onKeyDown(callback) {
    this.keyDownCallbacks.push(callback);
  }

  onKeyUp(callback) {
    this.keyUpCallbacks.push(callback);
  }

  getDirection() {
    let dx = 0;
    let dy = 0;

    if (this.keys['arrowup'] || this.keys['w']) dy = -1;
    if (this.keys['arrowdown'] || this.keys['s']) dy = 1;
    if (this.keys['arrowleft'] || this.keys['a']) dx = -1;
    if (this.keys['arrowright'] || this.keys['d']) dx = 1;

    if (dx === 0 && dy === 0) {
      dx = this.touchDirection.x;
      dy = this.touchDirection.y;
    }

    if (dx !== 0 && dy !== 0) {
      const factor = 1 / Math.sqrt(2);
      dx *= factor;
      dy *= factor;
    }

    return { dx, dy };
  }

  isKeyPressed(key) {
    return !!this.keys[key.toLowerCase()];
  }

  setTouchControlsElement(element) {
    this.touchControlsEl = element;
  }

  setTouchMode(mode) {
    if (!this.touchControlsEl) return;

    this.touchControlsEl.classList.remove('visible-always', 'hidden-always');

    switch (mode) {
      case 'always':
        this.touchControlsEl.classList.add('visible-always');
        break;
      case 'hide':
        this.touchControlsEl.classList.add('hidden-always');
        break;
      case 'auto':
      default:
        break;
    }
  }
}
