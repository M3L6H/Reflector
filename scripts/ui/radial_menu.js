import Vector from '../physics/vector.js';
import Button from './button.js';
import { Tower } from './ui.js';

import * as Constants from '../util/constants.js';

class RadialMenu {
  constructor(items, unit, zIndex, money, pos=new Vector(0, 0)) {
    if (items.length > 4) {
      throw "Radial menu cannot support more than 4 items!";
    }

    this.zIndex = zIndex;
    this.items = items;
    this.pos = pos;
    this.innerRadius = unit / 2;
    this.ringThickness = unit;
    this.unit = unit;
    this.money = money;
    this.prices = [Constants.BLUE_TOWER_PRICE, Constants.GREEN_TOWER_PRICE, Constants.RED_TOWER_PRICE, Constants.YELLOW_TOWER_PRICE];

    this.setupButtons();
  }

  setupButtons() {
    this.buttons = [];
    this.towers = [];
    const colors = ["blue", "green", "yellow", "red"];
    const prices =  [Constants.BLUE_TOWER_PRICE, Constants.GREEN_TOWER_PRICE, Constants.YELLOW_TOWER_PRICE, Constants.RED_TOWER_PRICE];
    const shifted = this.pos.add(new Vector(this.unit / 2, this.unit / 2));
    for (let i = 0; i < 4; ++i) {
      const a = (new Vector(this.innerRadius, 0)).rotate(Math.PI / 16).rotate(i * Math.PI / 2);
      const b = a.rotate(Math.PI * 6 / 16);
      const c = b.add((new Vector(0, this.ringThickness)).rotate(i * Math.PI / 2));
      const d = (new Vector(1, 1)).rotate(i * Math.PI / 2).unit().scale(c.mag());
      const e = a.add((new Vector(this.ringThickness, 0)).rotate(i * Math.PI / 2));
      this.towers.push(new Tower(shifted, (new Vector(this.innerRadius + this.ringThickness / 2.1, 0)).rotate(Math.PI / 4).rotate(i * Math.PI / 2), colors[i]));
      this.buttons.push(new Button(shifted, [a, b, c, d, e], this.zIndex, () => {
        if (this.money >= prices[i]) {
          const customEvent = new CustomEvent("PlaceTower", { detail: { pos: this.pos, color: colors[i] } });
          document.dispatchEvent(customEvent);
        }
      }));
    }
  }

  updatePos(vec) {
    this.pos = vec;
    const shifted = this.pos.add(new Vector(this.unit / 2, this.unit / 2));
    this.buttons.forEach(button => button.updatePos(shifted));
    this.towers.forEach(tower => tower.updatePos(shifted));
  }

  update({ ctx, width, height, unit }, money) {
    this.money = money;
    
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, width, height);
    ctx.translate(this.pos.x + unit / 2, this.pos.y + unit / 2);
    const innerVec = (new Vector(this.innerRadius, 0)).rotate(Math.PI / 16);
    const endVec = (new Vector(this.innerRadius, 0)).rotate(Math.PI * 7 / 16)
    const outerVec = innerVec.add(new Vector(this.ringThickness, 0));
    const endOuterVec = endVec.add(new Vector(0, this.ringThickness));
    const outerRadius = outerVec.mag();

    for (let i = 0; i < 4; ++i) {
      if (this.money >= this.prices[i]) {
        ctx.fillStyle = "#00AA00";
        ctx.strokeStyle = "#008800";
      } else {
        ctx.fillStyle = "#AA0000";
        ctx.strokeStyle = "#880000";
      }

      ctx.rotate(Math.PI / 2 * i);
      ctx.beginPath();
      ctx.arc(0, 0, this.innerRadius, Math.PI / 16, Math.PI * 7 / 16);
      ctx.lineTo(endOuterVec.x, endOuterVec.y);
      ctx.arc(0, 0, outerRadius, endOuterVec.angle(), outerVec.angle(), true);
      ctx.lineTo(innerVec.x, innerVec.y);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    this.towers.forEach(tower => tower.update(...arguments));
  }
}

export default RadialMenu;