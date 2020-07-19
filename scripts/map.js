import Empty from './tiles/empty.js';
import Placeable from "./tiles/placeable.js";
import Spawner from './tiles/spawner.js';
import End from './tiles/end.js';
import Obstacle from './tiles/obstacle.js';
import Void from './tiles/void.js';
import Reflector from './tiles/reflector.js';
import Tower from './tiles/tower.js';

import Normal from './enemies/enemy.js';
import Tank from './enemies/tank.js';
import Speeder from './enemies/speeder.js';

import Collider from './physics/collider.js';
import Vector from './physics/vector.js';

import * as Constants from './util/constants.js';

class Map {
  constructor({ map, paths, health, money, enemies }, unit, width, height) {
    this.unit = unit;

    this.maxHealth = health;
    this.health = this.maxHealth;
    this.money = money;
    this.paths = paths;
    this.map = this.generateMap(map);

    document.getElementById("health").innerHTML = this.health;
    this.updateMoney();
    
    this.enemies = [];
    this.spawnList = Object.assign({}, enemies);
    this.gameTime = 0;
    this.enemyCounter = document.getElementById("enemies");
    this.enemyCounter.innerHTML = Object.keys(this.spawnList).length;

    this.elapsed = 0;
    this.speed = 0.2;
    this.colorPath = "rgba(0, 255, 217, 0.1)";
    this.pathWidth = 4;
    this.pathLength = 8;
    this.towers = [];
    this.collider = new Collider(new Vector(0, 0), 0, [new Vector(0, 0), new Vector(width, 0), new Vector(width, height), new Vector(0, height)], "obstacles");

    document.addEventListener("PlaceTower", ({ detail: { pos, color } }) => this.placeTower(pos.x, pos.y, color));
    document.addEventListener("SellTower", ({ detail: tower }) => this.sellTower(tower));
    document.addEventListener("PlayerDamage", ({ detail: enemy }) => {
      this.health -= 1;
      document.getElementById("health").innerHTML = this.health;
      this.removeEnemy(enemy);
    });

    document.addEventListener("EarnMoney", ({ detail: enemy }) => {
      this.money += enemy.money;
      this.updateMoney();
      this.removeEnemy(enemy);
    });
  }

  getEnemyClass(num) {
    switch(num) {
      case 1:
        return Tank;
      case 2:
        return Speeder;
      default:
        return Normal;
    }
  }

  removeEnemy(enemy) {
    for (let i = 0; i < this.enemies.length; ++i) {
      if (this.enemies[i] === enemy) {
        this.enemies.splice(i, 1);
        break;
      }
    }
  }

  updateMoney() {
    document.getElementById("money").innerHTML = this.money;
  }

  priceFromColor(color) {
    let price;

    switch (color) {
      case "red":
        price = Constants.RED_TOWER_PRICE;
        break;
      case "blue":
        price = Constants.BLUE_TOWER_PRICE;
        break;
      case "green":
        price = Constants.GREEN_TOWER_PRICE;
        break;
      case "yellow":
        price = Constants.YELLOW_TOWER_PRICE;
        break;
    }

    return price;
  }

  placeTower(x, y, color="red") {
    const price = this.priceFromColor(color);
    
    if (this.money < price) return;
    this.money -= price;
    document.getElementById("money").innerHTML = this.money;
    
    this.map[Math.floor(y / this.unit)][Math.floor(x / this.unit)].removeButton();
    const tower = new Tower(x, y, this.unit, color);
    this.map[Math.floor(y / this.unit)][Math.floor(x / this.unit)] = tower;
    this.towers.push(tower);
  }

  sellTower(tower) {
    tower.button.remove();
    const price = this.priceFromColor(tower.color);
    this.money += price / 2;
    this.updateMoney();

    const placeable = new Placeable(tower.x, tower.y, this.unit);
    this.map[Math.floor(tower.y / this.unit)][Math.floor(tower.x / this.unit)] = placeable;

    for (let i = 0; i < this.towers.length; ++i) {
      if (this.towers[i] === tower) {
        this.towers.splice(i, 1);
        break;
      }
    }
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
    this.gameTime += delta;

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

    for (let time in this.spawnList) {
      if (parseInt(time) <= this.gameTime) {
        const [spawn, num] = this.spawnList[time];
        const Enemy = this.getEnemyClass(num);
        this.enemies.push(new Enemy(this.paths[spawn], unit));
        delete this.spawnList[time];
        this.enemyCounter.innerHTML = Object.keys(this.spawnList).length;
      }
    }
  }
}

export default Map;