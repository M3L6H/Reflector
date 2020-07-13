import Tile from "./tile.js";

class Obstacle extends Tile {
  constructor(x, y, size) {
    super(x, y, size);
    this.colorLight = "#946638";
    this.color = "#7A542E";
    this.colorDark = "#76522D";
  }
}

export default Obstacle;