import Tile from "./tile.js";

class Empty extends Tile {
  constructor(x, y, size) {
    super(x, y, size);
    this.colorLight = "#E3E1DE";
    this.color = "#D3D0CB";
    this.colorDark = "#D0CDC8";
  }
}

export default Empty;