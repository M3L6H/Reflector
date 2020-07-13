import Tile from "./tile.js";

class Reflector extends Tile {
  constructor(x, y, size) {
    super(x, y, size);
    this.colorLight = "#5F9577";
    this.color = "#57886C";
    this.colorDark = "#507C63";
    this.colorCenter = "#18DB6C";
    this.caretWidth = this.size / 8;
  }

  update({ ctx }) {
    Tile.prototype.update.apply(this, arguments);

    ctx.save();
    ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
    ctx.rotate(Math.PI / 4);

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

export default Reflector;