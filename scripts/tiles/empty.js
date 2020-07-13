import Tile from "./tile.js";

class Empty extends Tile {
  constructor(x, y, size) {
    super(x, y, size);
    this.colorLight = "#DECED3";
    this.color = "#D6C3C9";
    this.colorDark = "#CDB6BE";
  }
}

export default Empty;