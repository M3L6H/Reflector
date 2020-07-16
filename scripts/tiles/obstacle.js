import Tile from "./tile.js";
import Collider from '../physics/collider.js';
import Vector from '../physics/vector.js';

class Obstacle extends Tile {
  constructor(x, y, unit) {
    super(x, y, unit);
    this.colorLight = "#946638";
    this.color = "#7A542E";
    this.colorDark = "#76522D";
    this.collider = new Collider(new Vector(x, y), 0, [new Vector(0, 0), new Vector(unit, 0), new Vector(unit, unit), new Vector(0, unit)], "obstacles");
  }
}

export default Obstacle;