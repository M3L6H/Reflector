class Tile {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.colorLight = "#18344E";
    this.color = "#13293D";
    this.colorDark = "0E1F2F";
  }

  update(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Fill
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, this.size, this.size);
    
    // Top left
    ctx.strokeStyle = this.colorLight;
    ctx.moveTo(0, this.size);
    ctx.lineTo(0, 0);
    ctx.lineTo(this.size, 0);
    ctx.stroke();
    
    // Bottom right
    ctx.strokeStyle = this.colorDark;
    ctx.lineTo(this.size, this.size);
    ctx.lineTo(0, this.size);
    ctx.stroke();
    
    ctx.restore();
  }
}

export default Tile;