import Empty from './tiles/empty.js';
import Placeable from "./tiles/placeable.js";
import Spawner from './tiles/spawner.js';
import End from './tiles/end.js';
import Obstacle from './tiles/obstacle.js';
import Void from './tiles/void.js';
import Reflector from './tiles/reflector.js';
import Tower from './tiles/tower.js';

import Enemy from './enemies/enemy.js';

class Map {
  constructor({ map, paths }, unit) {
    this.unit = unit;

    this.paths = paths;
    this.map = this.generateMap(map);

    this.enemies = [
      new Enemy(Object.values(this.paths)[0], unit)
    ];

    this.elapsed = 0;
    this.speed = 0.2;
    this.colorPath = "rgba(0, 255, 217, 0.1)";
    this.pathWidth = 4;
    this.pathLength = 8;
    this.towers = [];

    document.addEventListener("PlaceTower", ({ detail: { pos, color } }) => this.placeTower(pos.x, pos.y, color));
  }

  placeTower(x, y, color="red") {
    this.map[Math.floor(y / this.unit)][Math.floor(x / this.unit)].removeButton();
    const tower = new Tower(x, y, this.unit, color);
    this.map[Math.floor(y / this.unit)][Math.floor(x / this.unit)] = tower;
    this.towers.push(tower);
  }

  generateMap(map) {
    return map.map((row, y) => {
      return row.map((code, x) => {
        switch (code) {
          case 0b00000:
            return new Empty(x * this.unit, y * this.unit, this.unit);
          case 0b00001:
            return new Placeable(x * this.unit, y * this.unit, this.unit);
          case 0b00011:
            return new Spawner(x * this.unit, y * this.unit, this.unit);
          case 0b00101:
            return new End(x * this.unit, y * this.unit, this.unit);
          case 0b11101:
            return new Obstacle(x * this.unit, y * this.unit, this.unit);
          case 0b11111:
            return new Void(x * this.unit, y * this.unit, this.unit);
          default:
            return new Reflector(x * this.unit, y * this.unit, this.unit, code);
        }
      });
    });
  }

  calculateDir(x, y) {
    if (x === 0) {
      return [-1, y];
    } else if (y === 0) {
      return [x, -1];
    } else if (x === 19) {
      return [20, y]
    } else {
      return [x, 12];
    }
  }

  drawPath(ctx, unit, offset=0) {
    const elapsed = (this.elapsed + offset) % 1000;

    for (let start in this.paths) {
      const path = this.paths[start];
      const tile = path[Math.floor(elapsed / 1000 * path.length)];

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = this.colorPath;
      ctx.lineWidth = this.pathWidth;
      ctx.moveTo(path[0][0] * unit + unit / 2, path[0][1] * unit + unit / 2);
      for (let i = 0; i < path.length; ++i) {
        const [x, y] = path[i];
        if (tile[0] === x && tile[1] === y) {
          ctx.lineTo(x * unit + unit / 2, y * unit + unit / 2);
        } else {
          ctx.moveTo(x * unit + unit / 2, y * unit + unit / 2);
        }
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  update({ delta, unit, ctx }) {
    this.elapsed = (this.elapsed + delta * this.speed) % 1000;

    this.map.forEach(row => {
      row.forEach(tile => tile.update(...arguments))
    });

    for (let i = 0; i < 10; ++i) {
      this.drawPath(ctx, unit, 8 * i);
    }

    this.enemies.forEach(enemy => {
      enemy.update(...arguments);
    });

    this.towers.forEach(tower => {
      tower.drawLaser(...arguments)
    });
  }
}

export default Map;