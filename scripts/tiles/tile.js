class Tile {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.lineWidth = 2;
    this.colorLight = "#FF0000";
    this.color = "#FF0000";
    this.colorDark = "#FF0000";
  }

  update({ ctx, mouseX, mouseY, canvas }) {
    if (this.x < mouseX && mouseX < this.x + this.size && this.y < mouseY && mouseY < this.y + this.size) {
      canvas.classList.remove("pointer");
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    // Fill
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, this.size, this.size);

    // Top left
    ctx.fillStyle = this.colorLight;
    ctx.fillRect(0, 0, this.size, this.lineWidth);
    ctx.fillRect(0, 0, this.lineWidth, this.size);
    
    // Bottom right
    ctx.fillStyle = this.colorDark;
    ctx.fillRect(0, this.size - this.lineWidth, this.size, this.lineWidth);
    ctx.fillRect(this.size - this.lineWidth, 0, this.lineWidth, this.size);
    
    ctx.restore();
  }
}

export default Tile;