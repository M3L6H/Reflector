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
import * as Storage from './util/storage.js';

class Map {
  constructor({ level, map, paths, health, money, enemies }, unit, width, height, canvas, button) {
    this.unit = unit;

    this.level = level;
    this.tutorial = parseInt(Storage.getItem("tutorial"));
    this.canvas = canvas;
    this.button = button;
    this.handleTutorialClick = this.handleTutorialClick.bind(this);

    if (this.tutorial < Constants.TUTORIAL_END) {
      setTimeout(() => canvas.addEventListener("click", this.handleTutorialClick), 2000);
    }
    
    this.map = this.generateMap(map);
    this.maxHealth = health;
    this.health = this.maxHealth;
    this.money = money;
    this.paths = paths;
    this.unit = unit;

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

  handleTutorialClick(e) {
    e.preventDefault();

    if (this.paused) return;
    this.tutorial = parseInt(Storage.getItem("tutorial"));

    if (this.tutorial === 2 && this.map[2][2] instanceof Placeable) return;
    if ((this.tutorial === 3 || this.tutorial === Constants.TUTORIAL_AIM_GREEN) && (Math.abs(this.towers[0].ray.collisions[0].hitPoint.x - this.unit) > this.unit / 10 || Math.abs(this.towers[0].ray.collisions[0].hitPoint.y - 3.5 * this.unit) > this.unit / 10)) {
      return;
    }
    if (this.tutorial >= 5 && this.tutorial < 20) return;
    if (this.tutorial >= 25 && this.tutorial < 27) return;
    if (this.tutorial === 21 && this.map[2][2] instanceof Tower) return;
    if (this.tutorial === 22 && this.map[2][2] instanceof Placeable) return;
    if (this.tutorial === 28 && this.map[4][17] instanceof Placeable) return;
    if (this.tutorial === Constants.TUTORIAL_AIM_YELLOW && (Math.abs(this.towers[1].ray.collisions[0].hitPoint.x - this.unit * 11.75) > this.unit / 10 || Math.abs(this.towers[1].ray.collisions[0].hitPoint.y - 8 * this.unit) > this.unit / 10)) {
      return;
    }

    if (this.tutorial === 20) {
      this.map[2][2].setSellable(true);
    }

    if (this.tutorial === 27) {
      this.map[4][17].setEnabled(true);
    }
    
    this.tutorial += 1;
    Storage.setItem("tutorial", this.tutorial);

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
    const tower = new Tower(x, y, this.unit, color, this.canvas, this.tutorial >= Constants.TUTORIAL_END);
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

    if ([0, 1, 4, 20, 24, 27, 30].includes(this.tutorial)) {
      if (!this.button.enabled) {
        this.button.enabled = true;
      }
    } else if (this.button.enabled) {
      this.button.enabled = false;
    }

    const tutorialBtn = document.getElementById("tutorial-btn");
    if (tutorialBtn.innerHTML === "Play Tutorial") {
      tutorialBtn.innerHTML = "Skip Tutorial";
      tutorialBtn.onclick = () => {
        Storage.setItem("tutorial", Constants.TUTORIAL_END);
        this.tutorial = Constants.TUTORIAL_END;
        location.reload();
      };
    }

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

        ctx.fillStyle = "#FF0000";
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
      case 3:
        ctx.save();
        ctx.translate(unit, height - unit * 5);
        ctx.fillStyle = "#444444";
        ctx.fillRect(0, 0, width - unit * 2, unit * 4);

        ctx.font = `${ unit / 3 }px sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "top";
        ctx.fillText("When placing a tower, you will have to aim it.", unit / 2, unit / 2, width - unit * 3);
        prevCount = this.renderLines("Normally you would be able to right click to cancel the placement, but since this a tutorial, that functionality is disabled.", prevCount, 2, ctx, unit, width - unit * 3);
        prevCount = this.renderLines("Aim the tower at the indicated position, then left click to confirm.", prevCount, 3, ctx, unit, width - unit * 3);

        ctx.fillStyle = "#FF0000";
        ctx.textBaseline = "bottom";
        ctx.textAlign = "right";
        ctx.font = `${ unit / 4 }px sans-serif`;
        ctx.fillText("Aim tower to continue", width - unit * 2.5, unit * 3.5);

        ctx.restore();

        ctx.save();
        ctx.translate(unit, 3 * unit);
        ctx.strokeStyle = "#FF0000";
        ctx.beginPath();
        ctx.arc(0, unit / 2, unit / 10, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
        break;
      case 4:
        ctx.save();
        ctx.translate(unit, height - unit * 5);
        ctx.fillStyle = "#444444";
        ctx.fillRect(0, 0, width - unit * 2, unit * 4);

        ctx.font = `${ unit / 3 }px sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "top";
        ctx.fillText("Now that you have placed a tower, you are ready to defend.", unit / 2, unit / 2, width - unit * 3);
        prevCount = this.renderLines("Note that the tower will keep firing in the direction you specified. Unlike traditional tower defense games, the towers in Reflector do not automatically aim at the enemies.", prevCount, 2, ctx, unit, width - unit * 3);
        prevCount = this.renderLines("In a moment, enemies will come flooding in. Lets watch our tower do some work!", prevCount, 3, ctx, unit, width - unit * 3);

        ctx.textBaseline = "bottom";
        ctx.textAlign = "right";
        ctx.font = `${ unit / 4 }px sans-serif`;
        ctx.fillText("Click to continue", width - unit * 2.5, unit * 3.5);

        ctx.restore();
        break;
      case 20:
        ctx.save();
        ctx.translate(unit, height - unit * 5);
        ctx.fillStyle = "#444444";
        ctx.fillRect(0, 0, width - unit * 2, unit * 4);

        ctx.font = `${ unit / 3 }px sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "top";
        ctx.fillText("Perfect! Look at that amazing defense.", unit / 2, unit / 2, width - unit * 3);
        prevCount = this.renderLines("If you look to the top left, you will see that some numbers have changed. We can see that there are 12 enemies remaining. We also now have 150 coins.", prevCount, 2, ctx, unit, width - unit * 3);
        prevCount = this.renderLines("We could use our money to buy another red or a blue tower. But if you were paying attention, you would have seen a green warning. That indicates tanky enemies are coming.", prevCount, 3, ctx, unit, width - unit * 3);

        ctx.textBaseline = "bottom";
        ctx.textAlign = "right";
        ctx.font = `${ unit / 4 }px sans-serif`;
        ctx.fillText("Click to continue", width - unit * 2.5, unit * 3.5);

        ctx.restore();
        break;
      case 21:
        ctx.save();
        ctx.translate(unit, height - unit * 5);
        ctx.fillStyle = "#444444";
        ctx.fillRect(0, 0, width - unit * 2, unit * 4);

        ctx.font = `${ unit / 3 }px sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "top";
        ctx.fillText("Tanky enemies have a lot of armor and health.", unit / 2, unit / 2, width - unit * 3);
        prevCount = this.renderLines("This means they are strong against both blue and yellow towers. However, they are weak to green towers, which have high penetration and apply a poison effect.", prevCount, 2, ctx, unit, width - unit * 3);
        prevCount = this.renderLines("But a green tower costs 200 coins. Fortunately we can sell towers by clicking on them. Selling a tower refunds us half its original cost. Let's sell our red tower now.", prevCount, 3, ctx, unit, width - unit * 3);

        ctx.fillStyle = "#FF0000";
        ctx.textBaseline = "bottom";
        ctx.textAlign = "right";
        ctx.font = `${ unit / 4 }px sans-serif`;
        ctx.fillText("Click on tower to sell", width - unit * 2.5, unit * 3.5);

        ctx.restore();
        break;
      case 22:
        ctx.save();
        ctx.translate(unit, height - unit * 5);
        ctx.fillStyle = "#444444";
        ctx.fillRect(0, 0, width - unit * 2, unit * 4);

        ctx.font = `${ unit / 3 }px sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "top";
        ctx.fillText("Perfect. Now we have enough to buy a green tower.", unit / 2, unit / 2, width - unit * 3);
        prevCount = this.renderLines("Let's place it at the same place where our red tower previously was.", prevCount, 2, ctx, unit, width - unit * 3);

        ctx.fillStyle = "#FF0000";
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
      case 23:
        ctx.save();
        ctx.translate(unit, height - unit * 5);
        ctx.fillStyle = "#444444";
        ctx.fillRect(0, 0, width - unit * 2, unit * 4);

        ctx.font = `${ unit / 3 }px sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "top";
        ctx.fillText("Let's aim the green tower the same way we aimed our red tower before.", unit / 2, unit / 2, width - unit * 3);

        ctx.fillStyle = "#FF0000";
        ctx.textBaseline = "bottom";
        ctx.textAlign = "right";
        ctx.font = `${ unit / 4 }px sans-serif`;
        ctx.fillText("Aim tower to continue", width - unit * 2.5, unit * 3.5);

        ctx.restore();

        ctx.save();
        ctx.translate(unit, 3 * unit);
        ctx.strokeStyle = "#FF0000";
        ctx.beginPath();
        ctx.arc(0, unit / 2, unit / 10, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
        break;
      case 24:
        ctx.save();
        ctx.translate(unit, height - unit * 5);
        ctx.fillStyle = "#444444";
        ctx.fillRect(0, 0, width - unit * 2, unit * 4);

        ctx.font = `${ unit / 3 }px sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "top";
        ctx.fillText("Amazing. Let's see how well our defense holds now.", unit / 2, unit / 2, width - unit * 3);
        prevCount = this.renderLines("Keep an eye out for that poison. It will really eat away at the tanky unit's health!", prevCount, 2, ctx, unit, width - unit * 3);

        ctx.textBaseline = "bottom";
        ctx.textAlign = "right";
        ctx.font = `${ unit / 4 }px sans-serif`;
        ctx.fillText("Click to continue", width - unit * 2.5, unit * 3.5);

        ctx.restore();
        break;
      case 27:
        ctx.save();
        ctx.translate(unit, height - unit * 5);
        ctx.fillStyle = "#444444";
        ctx.fillRect(0, 0, width - unit * 2, unit * 4);

        ctx.font = `${ unit / 3 }px sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "top";
        ctx.fillText("We killed the tank units, but now there's a new problem!", unit / 2, unit / 2, width - unit * 3);
        prevCount = this.renderLines("Yellow units are very fast. There's a chance our poison is not going to be enough to kill them before they reach the end of the map.", prevCount, 2, ctx, unit, width - unit * 3);

        ctx.textBaseline = "bottom";
        ctx.textAlign = "right";
        ctx.font = `${ unit / 4 }px sans-serif`;
        ctx.fillText("Click to continue", width - unit * 2.5, unit * 3.5);

        ctx.restore();
        break;
      case 28:
        ctx.save();
        ctx.translate(unit, height - unit * 5);
        ctx.fillStyle = "#444444";
        ctx.fillRect(0, 0, width - unit * 2, unit * 4);

        ctx.font = `${ unit / 3 }px sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "top";
        ctx.fillText("Fortunately we now have a lot of money.", unit / 2, unit / 2, width - unit * 3);
        prevCount = this.renderLines("Let's purchase a yellow laser. Yellow lasers are constant beams that deal high damage. They are very effective against yellow units.", prevCount, 2, ctx, unit, width - unit * 3);

        ctx.fillStyle = "#FF0000";
        ctx.textBaseline = "bottom";
        ctx.textAlign = "right";
        ctx.font = `${ unit / 4 }px sans-serif`;
        ctx.fillText("Place tower to continue", width - unit * 2.5, unit * 3.5);

        ctx.restore();

        ctx.save();
        ctx.translate(17 * unit, 4 * unit);
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = unit / 8;
        ctx.beginPath();
        ctx.arc(unit / 2, unit / 2, unit / 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
        break;
      case 29:
        ctx.save();
        ctx.translate(unit, height - unit * 3);
        ctx.fillStyle = "#444444";
        ctx.fillRect(0, 0, width - unit * 2, unit * 2);

        ctx.font = `${ unit / 3 }px sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "top";
        ctx.fillText("Perfect. Aim the tower at the indicated position.", unit / 2, unit / 2, width - unit * 3);

        ctx.fillStyle = "#FF0000";
        ctx.textBaseline = "bottom";
        ctx.textAlign = "right";
        ctx.font = `${ unit / 4 }px sans-serif`;
        ctx.fillText("Aim tower to continue", width - unit * 2.5, unit * 1.5);

        ctx.restore();

        ctx.save();
        ctx.translate(11 * unit, 8 * unit);
        ctx.strokeStyle = "#FF0000";
        ctx.beginPath();
        ctx.arc(0.75 * unit, 0, unit / 10, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
        break;
      case 30:
        ctx.save();
        ctx.translate(unit, height - unit * 5);
        ctx.fillStyle = "#444444";
        ctx.fillRect(0, 0, width - unit * 2, unit * 4);

        ctx.font = `${ unit / 3 }px sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "top";
        ctx.fillText("Amazing. That's the end of the tutorial.", unit / 2, unit / 2, width - unit * 3);
        prevCount = this.renderLines("For more information, click the question mark in the top right. You will be redirected to detailed written instructions with additional tips. You can play the tutorial again at any time by clicking the button in the top right.", prevCount, 2, ctx, unit, width - unit * 3);
        prevCount = this.renderLines("Now let's watch our towers work their magic!", prevCount, 3, ctx, unit, width - unit * 3);

        ctx.textBaseline = "bottom";
        ctx.textAlign = "right";
        ctx.font = `${ unit / 4 }px sans-serif`;
        ctx.fillText("Click to continue", width - unit * 2.5, unit * 3.5);

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

    this.elapsed = (this.elapsed + delta * this.speed) % 1000;

    for (let i = 0; i < 10; ++i) {
      this.drawPath(ctx, unit, 8 * i);
    }

    this.enemies.forEach(enemy => {
      enemy.update(...arguments, this.tutorial >= 27 && this.tutorial < Constants.TUTORIAL_END);
    });

    this.towers.forEach(tower => {
      tower.drawLaser(...arguments)
    });

    if (this.tutorial < Constants.TUTORIAL_END && this.level === 1) {
      this.renderTutorial(...arguments);
    }

    if (this.tutorial < 5 || (this.tutorial >= 20 && this.tutorial < 25) || (this.tutorial >= 27 && this.tutorial < Constants.TUTORIAL_END)) return;
    if (this.tutorial < Constants.TUTORIAL_END) this.tutorial = parseInt(Storage.getItem("tutorial"));
    this.gameTime += delta;

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