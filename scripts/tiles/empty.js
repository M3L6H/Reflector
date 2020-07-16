import Tile from "./tile.js";

class Empty extends Tile {
  constructor(x, y, unit) {
    super(x, y, unit);
    this.colorLight = "#DECED3";
    this.color = "#D6C3C9";
    this.colorDark = "#CDB6BE";
  }
}

export default Empty;