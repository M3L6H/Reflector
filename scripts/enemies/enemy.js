import normalize from '../util/normalize.js';

class Enemy {
  constructor(path, unit) {
    this.path = path;
    this.currNode = 0;
    this.x = this.path[this.currNode][0] * unit;
    this.y = this.path[this.currNode][1] * unit;
    this.speed = 20;

    this.health = 100;
    this.flying = false;
    this.shielded = false;
    this.reflectorUp = false;
    this.reflectorRight = false;
    this.reflectorDown = false;
    this.reflectorLeft = false;
  }

  update({ ctx, delta, unit }) {
    if (this.currNode + 1 >= this.path.length) {
      // TODO: Take damage
      return;
    }

    let [targetX, targetY] = this.path[this.currNode];
    targetX *= unit;
    targetY *= unit;

    if (this.x === targetX && this.y === targetY) {
      this.currNode += 1;
    }

    const [dirX, dirY] = normalize([targetX - this.x, targetY - this.y]);
    
    this.x += dirX * delta * this.speed / 500;
    this.y += dirY * delta * this.speed / 500;

    if (Math.sign(targetX - this.x) !== Math.sign(dirX)) {
      this.x = targetX;
    }

    if (Math.sign(targetY - this.y) !== Math.sign(dirY)) {
      this.y = targetY;
    }
    
    ctx.save();
    ctx.translate(this.x + unit / 2, this.y + unit / 2);
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(-5, -2, 10, 4);
    ctx.restore();
  }
}

export default Enemy;