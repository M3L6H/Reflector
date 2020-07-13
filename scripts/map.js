import Empty from './tiles/empty.js';
import Placeable from "./tiles/placeable.js";
import Spawner from './tiles/spawner.js';
import End from './tiles/end.js';
import Obstacle from './tiles/obstacle.js';
import Void from './tiles/void.js';
import Reflector from './tiles/reflector.js';

class Map {
  constructor({ map, paths }, size) {
    this.paths = paths;
    
    this.map = map.map((row, y) => {
      return row.map((code, x) => {
        switch (code) {
          case 0b00000:
            return new Empty(x * size, y * size, size);
          case 0b00001:
            return new Placeable(x * size, y * size, size);
          case 0b00011:
            return new Spawner(x * size, y * size, size);
          case 0b00101:
            return new End(x * size, y * size, size);
          case 0b11101:
            return new Obstacle(x * size, y * size, size);
          case 0b11111:
            return new Void(x * size, y * size, size);
          default:
            return new Reflector(x * size, y * size, size, code);
        }
      });
    });

    document.addEventListener("Update", ({ detail }) => this.update(detail));
  }

  update({ delta }) {
    this.map.forEach(row => {
      row.forEach(tile => tile.update(...arguments))
    });
  }
}

export default Map;