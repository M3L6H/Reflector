import Collider from '../physics/collider.js';
import Vector from '../physics/vector.js';
import normalize from '../util/normalize.js';
import clamp from '../util/clamp.js';
import debouncer from '../util/debouncer.js';

class Enemy {
  constructor(path, unit) {
    this.path = path;
    this.currNode = 0;
    this.x = this.path[this.currNode][0] * unit;
    this.y = this.path[this.currNode][1] * unit;
    this.speed = 20;

    this.collider = new Collider(new Vector(this.x + unit / 2, this.y + unit / 2), 0, [new Vector(-unit * 0.4, -unit * 0.4), new Vector(unit * 0.4, -unit * 0.4), new Vector(unit * 0.4, unit * 0.4), new Vector(-unit * 0.4, unit * 0.4)], "enemies", this);

    this.maxHealth = 100;
    this.health = 100;
    this.money = 10;
    this.armor = 0;
    this.flying = false;
    this.shielded = false;
    this.reflectorUp = false;
    this.reflectorRight = false;
    this.reflectorDown = false;
    this.reflectorLeft = false;

    this.colorBase = "#0C090D";
    this.color = "#E01A4F";

    this.dead = false;

    this.damage = debouncer(this.damage.bind(this), 200);
  }

  damage(dmg, pen, poison=0, slow=1) {
    if (slow !== 1) {
      const originalSpeed = this.speed;
      this.speed *= slow;
      if (this.timeout) clearTimeout(this.timeout);
      this.timeout = setTimeout(() => this.speed = originalSpeed, 1000);
    }
    this.health -= dmg - Math.max(0, this.armor - pen);

    if (poison !== 0 && !this.interval) {
      this.interval = setInterval(() => this.health -= poison, 100);
    }
  }

  update({ ctx, delta, unit }) {
    if (this.health <= 0) {
      this.dead = true;
      const e = new CustomEvent("EarnMoney", { detail: this });
      document.dispatchEvent(e);
    }
    
    if (this.dead) return;
    
    if (this.currNode + 1 >= this.path.length) {
      this.dead = true;
      const e = new CustomEvent("PlayerDamage", { detail: this });
      document.dispatchEvent(e);
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

    this.collider.updatePos(new Vector(this.x + unit / 2, this.y + unit / 2));
    
    ctx.save();
    ctx.translate(this.x + unit / 2, this.y + unit / 2);
    ctx.fillStyle = this.colorBase;

    ctx.beginPath();
    ctx.moveTo(-unit * 0.4, -unit * 0.4);
    ctx.lineTo(unit * 0.4, -unit * 0.4);
    ctx.lineTo(unit * 0.4, unit * 0.4);
    ctx.lineTo(-unit * 0.4, unit * 0.4);
    ctx.fill();

    // Draw rings
    const numRings = 3;
    for (let i = 0; i < Math.ceil(this.health / this.maxHealth) * numRings; ++i) {
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, unit * (0.3 - 0.1 * i), 0, clamp((this.health - i * this.maxHealth / numRings) / (this.maxHealth / numRings)) * 2 * Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  }
}

export default Enemy;