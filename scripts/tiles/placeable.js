import Tile from "./tile.js";

class Placeable extends Tile {
  constructor(x, y, size) {
    super(x, y, size);
    this.colorLight = "#18344E";
    this.color = "#13293D";
    this.colorDark = "#0E1F2F";
    this.over = false;

    document.addEventListener("click", this.click.bind(this));
  }

  click() {
    if (!this.over) return;

    const event = new CustomEvent("PlaceableClick", { detail: { placeable: this } });
    document.dispatchEvent(event);
  }

  update({ mouseX, mouseY, ctx, canvas }) {
    Tile.prototype.update.apply(this, arguments);

    if (this.x < mouseX && mouseX < this.x + this.size && this.y < mouseY && mouseY < this.y + this.size) {
      this.over = true;
      
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.fillStyle = "rgba(122, 255, 122, 0.3)";
      ctx.fillRect(0, 0, this.size, this.size);
      ctx.restore();

      canvas.classList.add("pointer");
    } else {
      this.over = false;
    }
  }
}

export default Placeable;