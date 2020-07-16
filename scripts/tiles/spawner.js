import Tile from "./tile.js";

class Spawner extends Tile {
  constructor(x, y, unit) {
    super(x, y, unit);
    this.colorLight = "#5F9577";
    this.color = "#57886C";
    this.colorDark = "#507C63";
    this.colorCenter = "#18DB6C";
    this.caretWidth = this.unit / 8;
    this.elapsed = 0;
    this.speed = 0.1;
  }

  update({ ctx, delta, unit }) {
    Tile.prototype.update.apply(this, arguments);
    this.elapsed = (this.elapsed + delta * this.speed) % 100;

    ctx.save();
    ctx.translate(this.x + unit / 2, this.y + unit / 2);
    ctx.rotate(Math.PI / 4);
    ctx.scale(this.elapsed / 100, this.elapsed / 100);

    // Fill center
    ctx.fillStyle = this.colorCenter;
    ctx.fillRect(-this.caretWidth, -this.caretWidth, this.caretWidth * 2, this.caretWidth * 2);
    
    ctx.strokeStyle = this.colorDark;
    ctx.lineWidth = this.caretWidth;

    // Draw caret
    ctx.beginPath();
    ctx.moveTo(-this.caretWidth, -this.caretWidth);
    ctx.lineTo(this.caretWidth, -this.caretWidth);
    ctx.lineTo(this.caretWidth, this.caretWidth);
    ctx.lineTo(-this.caretWidth, this.caretWidth);
    ctx.lineTo(-this.caretWidth, -this.caretWidth);
    ctx.stroke();

    ctx.restore();
  }
}

export default Spawner;