export class CollisionDetector {
  static checkCircle(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (a.size / 2 + b.size / 2);
  }

  static checkRect(a, b) {
    return (
      a.x - a.width / 2 < b.x + b.width / 2 &&
      a.x + a.width / 2 > b.x - b.width / 2 &&
      a.y - a.height / 2 < b.y + b.height / 2 &&
      a.y + a.height / 2 > b.y - b.height / 2
    );
  }

  static checkBounds(entity, bounds) {
    const halfSize = entity.size / 2;
    return (
      entity.x - halfSize >= bounds.x &&
      entity.x + halfSize <= bounds.x + bounds.width &&
      entity.y - halfSize >= bounds.y &&
      entity.y + halfSize <= bounds.y + bounds.height
    );
  }

  static clampToBounds(entity, bounds) {
    const halfSize = entity.size / 2;
    entity.x = Math.max(bounds.x + halfSize, Math.min(bounds.x + bounds.width - halfSize, entity.x));
    entity.y = Math.max(bounds.y + halfSize, Math.min(bounds.y + bounds.height - halfSize, entity.y));
  }
}
