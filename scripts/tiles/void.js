import Tile from "./tile.js";

class Void extends Tile {
  constructor(x, y, unit) {
    super(x, y, unit);
    this.colorLight = "#000000";
    this.color = "#000000";
    this.colorDark = "#000000";
  }
}

export default Void;