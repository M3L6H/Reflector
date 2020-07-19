import Tile from './tile.js';
import Vector from '../physics/vector.js';
import Ray from '../physics/ray.js';
import Button from '../ui/button.js';
import normalize from "../util/normalize.js";

import debouncer from '../util/debouncer.js';
import Collider from "../physics/collider.js";

class Tower extends Tile {
  constructor(x, y, unit, color) {
    super(x, y, unit);
    this.clicks = 0;
    this.aimed = false;
    this.emitting = true;
    this.color = color;
    this.ray = new Ray(new Vector(x + unit / 2, y + unit / 2), new Vector(0, 0), "ray");
    this.laserBolts = [];
    this.colliders = [];
    this.button = new Button(new Vector(x, y), [new Vector(0, 0), new Vector(unit, 0), new Vector(unit, unit), new Vector(0, unit)], 0, () => {
      const customEvent = new CustomEvent("SellTower", { detail: this });
      document.dispatchEvent(customEvent);
    });

    this.baseColor = "#2B2D42";
    this.baseDark = "#020202";

    switch(color) {
      case "blue":
        this.speed = 0.7;
        this.damage = 15;
        this.pen = 0;
        this.slow = 0.5;
        this.laserLength = unit;
        this.laserWidth = unit / 6;
        this.laserColor = "rgba(8, 164, 189, 0.8)";
        this.orbColor = "#08A4BD";
        this.orbBorder = "#446DF6";
        break;
      case "red":
        this.speed = 0.4;
        this.damage = 25;
        this.pen = 15;
        this.laserLength = unit * 3 / 4;
        this.laserWidth = unit / 8;
        this.laserColor = "rgba(255, 63, 120, 0.8)";
        this.orbColor = "#FF3F00";
        this.orbBorder = "#FF7F11";
        break;
      case "green":
        this.speed = 1.4;
        this.damage = 5;
        this.pen = 30;
        this.poison = 1;
        this.laserWidth = unit / 8;
        this.laserColor = "rgba(134, 205, 130, 0.8)";
        this.orbColor = "#86CD82";
        this.orbBorder = "#57A773";
        setInterval(() => {
          this.emitting = !this.emitting;
          this.colliders.forEach(collider => collider.enabled = this.emitting);
        }, this.speed * 1000);
        break;
      case "yellow":
        this.laserWidth = unit / 5;
        this.damage = 30;
        this.pen = 0;
        this.laserColor = "rgba(242, 220, 93, 0.8)";
        this.orbColor = "#F2DC5D";
        this.orbBorder = "#ED9B40";
        break;
    }

    this.calculateBounce = debouncer(this.calculateBounce.bind(this), 17);

    this.lockIn = this.lockIn.bind(this);
    this.cancel = this.cancel.bind(this);

    document.addEventListener("click", this.lockIn);
    document.addEventListener("contextmenu", this.cancel);
  }

  cancel(e) {
    e.preventDefault();

    if (!this.aimed) {
      document.dispatchEvent(new CustomEvent("RefundTower", { detail: this }));
    }
  }

  lockIn() {
    // Dumb, but necessary because the click triggers when the tower is placed
    this.clicks++;

    if (this.clicks > 1) {
      this.aimed = true;

      if (!this.laserLength) {
        this.colliders.forEach(collider => collider.remove());
        this.colliders = [];
        
        let start = new Vector(this.x + this.unit / 2, this.y + this.unit / 2);
        for (let i = 0; i < this.ray.numCollisions; ++i) {
          const rayHit = this.ray.collisions[i];
          const endPoint = rayHit.hitPoint;
          this.colliders.push(new Collider(new Vector(0, 0), 0, [start, endPoint], "lasers"));
          start = endPoint;
        }
      }
      
      document.removeEventListener("click", this.lockIn);
      document.removeEventListener("contextmenu", this.cancel);
    }
  }

  calculateBounce() {
    this.ray.bounceCast("reflectors");
  }

  update({ ctx, unit })  {
    this.colliders.forEach(collider => {
      for (let i = 0; i < collider.numCollisions; ++i) {
        const enemy = collider.collisions[i].collidingWith.parent;
        enemy.damage(this.damage, this.pen, this.poison, this.slow);
      }
    });
    
    Tile.prototype.update.apply(this, arguments);

    ctx.save();
    ctx.translate(this.x + unit / 2, this.y + unit / 2);
    
    // Base
    ctx.fillStyle = this.baseColor;
    ctx.strokeStyle = this.baseDark;
    ctx.beginPath();
    ctx.moveTo(-unit / 8, unit / 2);
    ctx.lineTo(unit / 8, unit / 2);
    ctx.lineTo(unit / 2, unit / 8);
    ctx.lineTo(unit / 2, -unit / 8);
    ctx.lineTo(unit / 8, -unit / 2);
    ctx.lineTo(-unit / 8, -unit / 2);
    ctx.lineTo(-unit / 2, -unit / 8);
    ctx.lineTo(-unit / 2, unit / 8);
    ctx.lineTo(-unit / 8, unit / 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  emit(ctx, unit) {
    if (!this.emitting) return;

    // If we have a length, we are a pulse, otherwise we are a beam
    if (this.laserLength) {
      this.emitting = false;
      setTimeout(() => this.emitting = true, this.speed * 1000);
      this.laserBolts.push({ pos: new Vector(this.x + unit / 2, this.y + unit / 2), currNode: 0 });
      this.colliders.push(new Collider(new Vector(this.x + unit / 2, this.y + unit / 2), 0, [new Vector(0, 0), new Vector(this.laserLength, 0)], "lasers"));
    } else {
      // If we have a speed, we aren't constantly firing
      ctx.strokeStyle = this.laserColor;
      ctx.lineWidth = this.laserWidth;
      ctx.beginPath();
      ctx.moveTo(this.x + unit / 2, this.y + unit / 2);
      for (let i = 0; i < this.ray.numCollisions; ++i) {
        const rayHit = this.ray.collisions[i];
        ctx.lineTo(rayHit.hitPoint.x, rayHit.hitPoint.y);
      }
      ctx.stroke();

      ctx.lineWidth = this.laserWidth / 2;
      ctx.beginPath();
      ctx.moveTo(this.x + unit / 2, this.y + unit / 2);
      for (let i = 0; i < this.ray.numCollisions; ++i) {
        const rayHit = this.ray.collisions[i];
        ctx.lineTo(rayHit.hitPoint.x, rayHit.hitPoint.y);
      }
      ctx.stroke();
    }
  }

  drawLaserBolts({ ctx, delta }) {
    for (let i = 0; i < this.laserBolts.length; ++i) {
      const that = this.laserBolts[i];

      const target = this.ray.collisions[that.currNode].hitPoint;
  
      const [dirX, dirY] = normalize([target.x - that.pos.x, target.y - that.pos.y]);
      
      that.pos.x += dirX * delta;
      that.pos.y += dirY * delta;
  
      // Correct overshooting
      if (Math.sign(target.x - that.pos.x) !== Math.sign(dirX)) {
        that.pos.x = target.x;
      }
  
      if (Math.sign(target.y - that.pos.y) !== Math.sign(dirY)) {
        that.pos.y = target.y;
      }

      this.colliders[i].updatePos(that.pos);
      this.colliders[i].updateModel([new Vector(0, 0), new Vector(-dirX * this.laserLength, -dirY * this.laserLength)]);
  
      if (that.pos.x === target.x && that.pos.y === target.y) {
        that.currNode += 1;
        
        if (that.currNode >= this.ray.collisions.length) {
          this.laserBolts.splice(i, 1);
          this.colliders[i].remove();
          this.colliders.splice(i, 1);
          --i;
        }
      }

      const endPoint = (new Vector(dirX, dirY)).inv().scale(this.laserLength);

      ctx.save();
      ctx.translate(that.pos.x, that.pos.y);
      ctx.lineWidth = this.laserWidth;
      ctx.strokeStyle = this.laserColor;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawLaser({ ctx, unit, mouseX, mouseY }) {
    if (!this.aimed) {
      const dir = new Vector(mouseX - this.x - unit / 2, mouseY - this.y - unit / 2);
      this.ray.updateDir(dir);
    
      this.calculateBounce();
    }

    ctx.save();
    // Draw laser
    if (this.aimed) {
      this.emit(ctx, unit);
      this.drawLaserBolts(...arguments);
    } else {
      ctx.strokeStyle = "#FF0000";
      ctx.setLineDash([4, 15]);
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(this.x + unit / 2, this.y + unit / 2);
      for (let i = 0; i < this.ray.numCollisions; ++i) {
        const rayHit = this.ray.collisions[i];
        ctx.lineTo(rayHit.hitPoint.x, rayHit.hitPoint.y);
      }
      ctx.stroke();
    }

    ctx.translate(this.x + unit / 2, this.y + unit / 2);

    // Orb
    ctx.fillStyle = this.orbColor;
    ctx.lineWidth = 1;
    ctx.strokeStyle = this.orbBorder;
    ctx.beginPath();
    ctx.arc(0, 0, unit / 3, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();

    // Highlight
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = unit / 8;
    ctx.beginPath();
    ctx.arc(0, 0, unit / 5, Math.PI * 13 / 8, Math.PI * 15 / 8);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, unit / 5, Math.PI * 4 / 6 - 0.2, Math.PI * 5 / 6 + 0.2);
    ctx.stroke();
    ctx.restore();
  }
}

export default Tower;