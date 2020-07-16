class Tile {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.borderWidth = 2;
    this.colorLight = "#FF0000";
    this.color = "#FF0000";
    this.colorDark = "#FF0000";
  }

  update({ ctx, mouseX, mouseY, canvas }) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Fill
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, this.size, this.size);

    // Top left
    ctx.fillStyle = this.colorLight;
    ctx.fillRect(0, 0, this.size, this.borderWidth);
    ctx.fillRect(0, 0, this.borderWidth, this.size);
    
    // Bottom right
    ctx.fillStyle = this.colorDark;
    ctx.fillRect(0, this.size - this.borderWidth, this.size, this.borderWidth);
    ctx.fillRect(this.size - this.borderWidth, 0, this.borderWidth, this.size);
    
    ctx.restore();
  }
}

export default Tile;