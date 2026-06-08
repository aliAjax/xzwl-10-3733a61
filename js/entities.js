export class Entity {
  constructor(type, x, y, size, config) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.size = size;
    this.config = config;
    this.active = true;
    this.rotation = 0;
  }

  update(deltaTime) {
    this.rotation += 0.02;
  }

  render(ctx) {
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      size: this.size
    };
  }

  onCollide(target) {
    return null;
  }

  deactivate() {
    this.active = false;
  }
}

export class Star extends Entity {
  constructor(x, y, config) {
    super('star', x, y, config.size, config);
    this.points = config.points;
    this.pulsePhase = Math.random() * Math.PI * 2;
  }

  update(deltaTime) {
    super.update(deltaTime);
    this.pulsePhase += 0.05;
  }

  render(ctx) {
    const pulse = 1 + Math.sin(this.pulsePhase) * 0.2;
    const size = this.size * pulse;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.shadowBlur = 20;
    ctx.shadowColor = this.config.glowColor;

    ctx.fillStyle = this.config.color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = Math.cos(angle) * size / 2;
      const y = Math.sin(angle) * size / 2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(-size / 6, -size / 6, size / 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  onCollide(target) {
    if (target.type === 'player') {
      this.deactivate();
      return { type: 'score', value: this.points };
    }
    return null;
  }
}

export class Obstacle extends Entity {
  constructor(x, y, config, bounds) {
    super('obstacle', x, y, config.size, config);
    this.damage = config.damage;
    this.bounds = bounds;
    
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * config.speed;
    this.vy = Math.sin(angle) * config.speed;
    
    this.vertices = this.generateVertices();
  }

  generateVertices() {
    const vertices = [];
    const numVertices = 7 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numVertices; i++) {
      const angle = (i / numVertices) * Math.PI * 2;
      const radius = (this.size / 2) * (0.7 + Math.random() * 0.6);
      vertices.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
    }
    return vertices;
  }

  update(deltaTime) {
    super.update(deltaTime);
    
    this.x += this.vx;
    this.y += this.vy;

    const halfSize = this.size / 2;
    if (this.x - halfSize <= this.bounds.x || this.x + halfSize >= this.bounds.x + this.bounds.width) {
      this.vx *= -1;
      this.x = Math.max(this.bounds.x + halfSize, Math.min(this.bounds.x + this.bounds.width - halfSize, this.x));
    }
    if (this.y - halfSize <= this.bounds.y || this.y + halfSize >= this.bounds.y + this.bounds.height) {
      this.vy *= -1;
      this.y = Math.max(this.bounds.y + halfSize, Math.min(this.bounds.y + this.bounds.height - halfSize, this.y));
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.shadowBlur = 15;
    ctx.shadowColor = this.config.glowColor;

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size / 2);
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(0.5, this.config.color);
    gradient.addColorStop(1, '#991b1b');

    ctx.fillStyle = gradient;
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    for (let i = 1; i < this.vertices.length; i++) {
      ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    for (let i = 0; i < 3; i++) {
      const cx = (Math.random() - 0.5) * this.size * 0.5;
      const cy = (Math.random() - 0.5) * this.size * 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, this.size * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  onCollide(target) {
    if (target.type === 'player') {
      return { type: 'damage', value: this.damage };
    }
    return null;
  }
}

export class PowerUp extends Entity {
  constructor(x, y, type, config) {
    super('powerup', x, y, config.size, config);
    this.powerUpType = type;
    this.lifetime = config.lifetime || 8000;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.floatPhase = Math.random() * Math.PI * 2;
  }

  update(deltaTime) {
    super.update(deltaTime);
    this.pulsePhase += 0.08;
    this.floatPhase += 0.03;
    this.lifetime -= deltaTime;

    if (this.lifetime <= 0) {
      this.deactivate();
    }
  }

  render(ctx) {
    const pulse = 1 + Math.sin(this.pulsePhase) * 0.15;
    const float = Math.sin(this.floatPhase) * 3;
    const size = this.size * pulse;

    const alpha = this.lifetime < 2000 ? this.lifetime / 2000 : 1;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(this.x, this.y + float);
    ctx.rotate(this.rotation);

    ctx.shadowBlur = 25;
    ctx.shadowColor = this.config.glowColor;

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, this.config.color);
    gradient.addColorStop(1, this.config.color);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2 + 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.font = `${size * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.config.symbol, 0, 0);

    ctx.restore();
  }

  onCollide(target) {
    if (target.type === 'player') {
      this.deactivate();
      return {
        type: 'powerup',
        powerUpType: this.powerUpType,
        config: this.config
      };
    }
    return null;
  }
}
