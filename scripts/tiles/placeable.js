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

  removeButton() {
    this.button.remove();
  }

  handleClick() {
    const customEvent = new CustomEvent("TowerMenu", { detail: { pos: new Vector(this.x, this.y )} });
    document.dispatchEvent(customEvent);
  }

  update({ ctx }) {
    Tile.prototype.update.apply(this, arguments);
  }
}

export default Placeable;