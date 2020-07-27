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
import getLines from './util/get_lines.js';

class Map {
  constructor({ level, map, paths, health, money, enemies }, unit, width, height, canvas) {
    this.unit = unit;

    this.level = level;
    this.tutorial = parseInt(localStorage.getItem("tutorial"));
    this.canvas = canvas;
    this.handleTutorialClick = this.handleTutorialClick.bind(this);

    if (this.tutorial < Constants.TUTORIAL_END) {
      setTimeout(() => canvas.addEventListener("click", this.handleTutorialClick), 1000);
    }
    
    this.map = this.generateMap(map);
    this.maxHealth = health;
    this.health = this.maxHealth;
    this.money = money;
    this.paths = paths;

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
    document.addEventListener("RefundTower", ({ detail: tower }) => this.sellTower(tower, 1));
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

  handleTutorialClick() {
    if (this.paused) return;

    if (this.tutorial === 2 && this.map[2][2] instanceof Placeable) return;
    
    this.tutorial += 1;
    localStorage.setItem("tutorial", this.tutorial);

    if (this.tutorial === 2) {
      this.map[2][2].setEnabled(true);
    }
    
    if (this.tutorial >= Constants.TUTORIAL_END) {
      this.canvas.removeEventListener("click", this.handleTutorialClick);
    }
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

  sellTower(tower, refund=0.5) {
    tower.button.remove();
    const price = this.priceFromColor(tower.color);
    this.money += price * refund;
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
    const tutorial = this.tutorial < Constants.TUTORIAL_END;
    
    return map.map((row, y) => {
      return row.map((code, x) => {
        switch (code) {
          case 0b00000:
            return new Empty(x * this.unit, y * this.unit, this.unit);
          case 0b00001:
            return new Placeable(x * this.unit, y * this.unit, this.unit, !tutorial);
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

  renderLines(text, prevCount, numParas, ctx, unit, maxWidth) {
    const lines = getLines(ctx, text, maxWidth);
    lines.forEach((line, i) => {
      ctx.fillText(line, unit / 2, unit / 2 + numParas * unit / 3 + ((i + prevCount) * unit / 3), maxWidth)
    });
    return lines.length;
  }

  renderTutorial({ unit, ctx, height, width }) {
    let prevCount = 0;

    switch(this.tutorial) {
      case 0:
        ctx.save();
        ctx.translate(unit, height - unit * 5);
        ctx.fillStyle = "#444444";
        ctx.fillRect(0, 0, width - unit * 2, unit * 4);

        ctx.font = `${ unit / 3 }px sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "top";
        ctx.fillText("Welcome to Reflector!", unit / 2, unit / 2, width - unit * 3);
        prevCount = this.renderLines("Reflector is a tower defense game where the towers all shoot lasers. Your goal is to position and aim your lasers to reflect off the reflectors around the map and destroy your enemies.", prevCount, 2, ctx, unit, width - unit * 3);
        prevCount = this.renderLines("Defeat all the enemies and you win, but let too many escape and you will lose. You can see the number of lives you have in the bar above.", prevCount, 3, ctx, unit, width - unit * 3);

        ctx.textBaseline = "bottom";
        ctx.textAlign = "right";
        ctx.font = `${ unit / 4 }px sans-serif`;
        ctx.fillText("Click to continue", width - unit * 2.5, unit * 3.5);
        ctx.restore();
        break;
      case 1:
        ctx.save();
        ctx.translate(unit, height - unit * 5);
        ctx.fillStyle = "#444444";
        ctx.fillRect(0, 0, width - unit * 2, unit * 4);

        ctx.font = `${ unit / 3 }px sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "top";
        ctx.fillText("Enemies spawn at the green tile and try to get to the red tile.", unit / 2, unit / 2, width - unit * 3);
        prevCount = this.renderLines("You can place towers on the blue tiles and the lasers they shoot will reflect off the silver edges. Black and white tiles are open space, but brown tiles will obstruct your lasers.", prevCount, 2, ctx, unit, width - unit * 3);
        prevCount = this.renderLines("Let's try placing a tower now.", prevCount, 3, ctx, unit, width - unit * 3);

        ctx.textBaseline = "bottom";
        ctx.textAlign = "right";
        ctx.font = `${ unit / 4 }px sans-serif`;
        ctx.fillText("Click to continue", width - unit * 2.5, unit * 3.5);

        ctx.restore();
        break;
      case 2:
        ctx.save();
        ctx.translate(unit, height - unit * 5);
        ctx.fillStyle = "#444444";
        ctx.fillRect(0, 0, width - unit * 2, unit * 4);

        ctx.font = `${ unit / 3 }px sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "top";
        ctx.fillText("Click on the indicated blue tile and select a red tower.", unit / 2, unit / 2, width - unit * 3);
        prevCount = this.renderLines("Red towers are the most basic towers. They have an average fire rate, average damage, and average armor pierce. They are also the cheapest towers available.", prevCount, 2, ctx, unit, width - unit * 3);

        ctx.textBaseline = "bottom";
        ctx.textAlign = "right";
        ctx.font = `${ unit / 4 }px sans-serif`;
        ctx.fillText("Place tower to continue", width - unit * 2.5, unit * 3.5);

        ctx.restore();

        ctx.save();
        ctx.translate(2 * unit, 2 * unit);
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = unit / 8;
        ctx.beginPath();
        ctx.arc(unit / 2, unit / 2, unit / 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
        break;
    }
  }

  update({ delta, unit, ctx, paused }) {
    this.paused = paused;
    if (paused) return;

    this.map.forEach(row => {
      row.forEach(tile => tile.update(...arguments))
    });

    if (this.tutorial < Constants.TUTORIAL_END) {
      this.renderTutorial(...arguments);
    }

    if (this.tutorial < 3) return;
    
    this.elapsed = (this.elapsed + delta * this.speed) % 1000;
    this.gameTime += delta;

    for (let i = 0; i < 10; ++i) {
      this.drawPath(ctx, unit, 8 * i);
    }

    this.enemies.forEach(enemy => {
      enemy.update(...arguments);
    });

    this.towers.forEach(tower => {
      tower.drawLaser(...arguments)
    });

    if (this.tutorial < Constants.TUTORIAL_END) return;

    for (let time in this.spawnList) {
      if (parseInt(time) <= this.gameTime && this.elapsed % 500 < 300) {
        const [spawn, num] = this.spawnList[time];
        const [x, y] = spawn.split(", ").map(num => parseInt(num));
        ctx.save();
        ctx.translate(x * unit + unit / 2, y * unit + unit / 2);
        switch(num) {
          case 1:
            ctx.fillStyle = "#7EA16B";
            break;
          case 2:
            ctx.fillStyle = "#F9C22E";
            break;
          default:
            ctx.fillStyle = "#E01A4F";
        }
        ctx.font = `${ unit * 0.75 }px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(0, -unit / 2);
        ctx.lineTo(unit / 2, unit / 2);
        ctx.lineTo(-unit / 2, unit / 2);
        ctx.lineTo(0, -unit / 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("!", 0, unit / 6);
        ctx.restore();
      }
      
      if (parseInt(time) + 5000 <= this.gameTime) {
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