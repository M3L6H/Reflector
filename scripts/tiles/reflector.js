import Tile from "./tile.js";

class Reflector extends Tile {
  constructor(x, y, size, code) {
    super(x, y, size);
    this.colorLight = "#946638";
    this.color = "#7A542E";
    this.colorDark = "#76522D";
    this.colorReflector = "#E8E676";
    this.colorHighlight = "#F5F4C1";
    this.thickness = this.size / 8;

    this.up = code & 0b00010;
    this.right = code & 0b00100;
    this.down = code & 0b01000;
    this.left = code & 0b10000;
  }

  update({ ctx }) {
    Tile.prototype.update.apply(this, arguments);

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = this.colorReflector;

    if (this.up) {
      ctx.fillRect(0, 0, this.size, this.thickness);
    }

    if (this.right) {
      ctx.fillRect(this.size-this.thickness, 0, this.thickness, this.size);
    }

    if (this.down) {
      ctx.fillRect(0, this.size-this.thickness, this.size, this.thickness);
    }

    if (this.left) {
      ctx.fillRect(0, 0, this.thickness, this.size);
    }

    ctx.fillStyle = this.colorHighlight;

    if (this.up) {
      ctx.fillRect(0, this.thickness / 4, this.size, this.thickness / 2);
    }

    if (this.right) {
      ctx.fillRect(this.size-this.thickness * 0.75, 0, this.thickness / 2, this.size);
    }

    if (this.down) {
      ctx.fillRect(0, this.size-this.thickness * 0.75, this.size, this.thickness / 2);
    }

    if (this.left) {
      ctx.fillRect(this.thickness / 4, 0, this.thickness / 2, this.size);
    }
    
    ctx.restore();
  }
}

export default Reflector;