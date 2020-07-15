import Tile from "./tile.js";
import Button from '../ui/button.js';
import Vector from '../physics/vector.js';

class Placeable extends Tile {
  constructor(x, y, unit) {
    super(x, y, unit);
    this.colorLight = "#18344E";
    this.color = "#13293D";
    this.colorDark = "#0E1F2F";
    this.over = false;
    this.button = new Button(new Vector(x, y), [new Vector(0, 0), new Vector(0, unit), new Vector(unit, unit), new Vector(unit, 0)], 0, this.handleClick.bind(this));
  }

  handleClick() {
    console.log("Placeable", this.x, this.y);
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