import Tile from "./tile.js";

class Reflector extends Tile {
  constructor(x, y, unit, code) {
    super(x, y, unit);
    this.colorLight = "#946638";
    this.color = "#7A542E";
    this.colorDark = "#76522D";
    this.colorReflector = "#C0C0C0";
    this.colorHighlight = "#EEEEEE";
    this.thickness = this.unit / 8;

    this.up = code & 0b00010;
    this.right = code & 0b00100;
    this.down = code & 0b01000;
    this.left = code & 0b10000;
  }

  update({ ctx, unit }) {
    Tile.prototype.update.apply(this, arguments);

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = this.colorReflector;

    if (this.up) {
      ctx.fillRect(0, 0, unit, this.thickness);
    }

    if (this.right) {
      ctx.fillRect(unit-this.thickness, 0, this.thickness, unit);
    }

    if (this.down) {
      ctx.fillRect(0, unit-this.thickness, unit, this.thickness);
    }

    if (this.left) {
      ctx.fillRect(0, 0, this.thickness, unit);
    }

    ctx.fillStyle = this.colorHighlight;

    if (this.up) {
      ctx.fillRect(0, this.thickness / 4, unit, this.thickness / 2);
    }

    if (this.right) {
      ctx.fillRect(unit-this.thickness * 0.75, 0, this.thickness / 2, unit);
    }

    if (this.down) {
      ctx.fillRect(0, unit-this.thickness * 0.75, unit, this.thickness / 2);
    }

    if (this.left) {
      ctx.fillRect(this.thickness / 4, 0, this.thickness / 2, unit);
    }
    
    ctx.restore();
  }
}

export default Reflector;