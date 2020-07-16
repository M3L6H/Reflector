import Collider from '../physics/collider.js';
import Vector from '../physics/vector.js';

class Tile {
  constructor(x, y, unit) {
    this.x = x;
    this.y = y;
    this.unit = unit;
    this.borderWidth = 2;
    this.colorLight = "#FF0000";
    this.color = "#FF0000";
    this.colorDark = "#FF0000";
    this.collider = new Collider(new Vector(x, y), 0, [new Vector(0, 0), new Vector(unit, 0), new Vector(unit, unit), new Vector(0, unit)], "obstacles");
  }

  update({ ctx, unit }) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Fill
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, unit, unit);

    // Top left
    ctx.fillStyle = this.colorLight;
    ctx.fillRect(0, 0, unit, this.borderWidth);
    ctx.fillRect(0, 0, this.borderWidth, unit);
    
    // Bottom right
    ctx.fillStyle = this.colorDark;
    ctx.fillRect(0, unit - this.borderWidth, unit, this.borderWidth);
    ctx.fillRect(unit - this.borderWidth, 0, this.borderWidth, unit);
    
    ctx.restore();
  }
}

export default Tile;