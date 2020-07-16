import Tile from "./tile.js";

class End extends Tile {
  constructor(x, y, unit) {
    super(x, y, unit);
    this.colorLight = "#8D0147";
    this.color = "#6A0136";
    this.colorDark = "#650133";
    this.colorX = "#C20C2D";
    this.xWidth = this.unit / 8;
    this.elapsed = 0;
    this.speed = 0.25;
  }

  update({ ctx, delta, unit }) {
    Tile.prototype.update.apply(this, arguments);
    this.elapsed = (this.elapsed + delta * this.speed) % 360;

    ctx.save();
    ctx.translate(this.x + unit / 2, this.y + unit / 2);
    ctx.rotate(Math.PI / 180 * (this.elapsed));

    ctx.strokeStyle = this.colorX;
    ctx.lineWidth = this.xWidth;

    // Draw X
    ctx.beginPath();
    ctx.moveTo(-this.xWidth, -this.xWidth);
    ctx.lineTo(this.xWidth, this.xWidth);
    ctx.moveTo(this.xWidth, -this.xWidth);
    ctx.lineTo(-this.xWidth, this.xWidth);
    ctx.stroke();

    ctx.restore();

    ctx.save();
    ctx.translate(this.x + unit / 2, this.y + unit / 2);
    ctx.fillStyle = this.colorX;

    if (this.elapsed > 270) {
      ctx.beginPath();
      ctx.arc(-2 * this.xWidth, 2 * this.xWidth, this.xWidth, 0, 2 * Math.PI);
      ctx.fill();
    } else if (this.elapsed > 180) {
      ctx.beginPath();
      ctx.arc(2 * this.xWidth, 2 * this.xWidth, this.xWidth, 0, 2 * Math.PI);
      ctx.fill();
    } else if (this.elapsed > 90) {
      ctx.beginPath();
      ctx.arc(2 * this.xWidth, -2 * this.xWidth, this.xWidth, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(-2 * this.xWidth, -2 * this.xWidth, this.xWidth, 0, 2 * Math.PI);
      ctx.fill();
    }
      
    ctx.restore();
  }
}

export default End;