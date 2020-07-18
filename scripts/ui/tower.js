export default class Tower {
  constructor(pos, offset, color, price) {
    this.pos = pos;
    this.offset = offset;
    this.price = price;

    this.baseColor = "#2B2D42";
    this.baseDark = "#020202";

    switch(color) {
      case "blue":
        this.orbColor = "#08A4BD";
        this.orbBorder = "#446DF6";
        break;
      case "red":
        this.orbColor = "#FF3F00";
        this.orbBorder = "#FF7F11";
        break;
      case "green":
        this.orbColor = "#86CD82";
        this.orbBorder = "#57A773";
        break;
      case "yellow":
        this.orbColor = "#F2DC5D";
        this.orbBorder = "#ED9B40";
        break;
    }
  }

  updatePos(vec) {
    this.pos = vec;
  }

  update({ ctx, unit }) {
    ctx.save();
    ctx.translate(this.pos.x + this.offset.x, this.pos.y + this.offset.y);

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
    ctx.stroke();
    ctx.fill();

    // Orb
    ctx.fillStyle = this.orbColor;
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

    // Price
    ctx.fillStyle = "#000000";
    ctx.font = `${ unit / 3 }px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.price, 0, 0);
    ctx.restore();
  }
};
