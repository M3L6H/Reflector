import Vector from '../physics/vector.js';
import Button from '../ui/button.js';

class RadialMenu {
  constructor(items, unit, zIndex, pos=new Vector(0, 0)) {
    if (items.length > 4) {
      throw "Radial menu cannot support more than 4 items!";
    }

    this.zIndex = zIndex;
    this.items = items;
    this.pos = pos;
    this.innerRadius = unit / 2;
    this.ringThickness = unit;

    this.setupButtons();
  }

  setupButtons() {
    this.buttons = [];
    for (let i = 0; i < 4; ++i) {
      const a = (new Vector(this.innerRadius, 0)).rotate(Math.PI / 16).rotate(i * Math.PI / 2);
      const b = a.rotate(Math.PI * 6 / 16);
      const c = b.add((new Vector(0, this.ringThickness)).rotate(i * Math.PI / 2));
      const d = (new Vector(1, 1)).rotate(i * Math.PI / 2).unit().scale(c.mag());
      const e = a.add((new Vector(this.ringThickness, 0)).rotate(i * Math.PI / 2));
      this.buttons.push(new Button(this.pos, [a, b, c, d, e], this.zIndex, () => console.log("Click")));
    }
  }

  updatePos(vec) {
    this.pos = vec;
    this.buttons.forEach(button => button.updatePos(vec));
  }

  update({ ctx, width, height }) {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, width, height);
    ctx.translate(this.pos.x, this.pos.y);
    const innerVec = (new Vector(this.innerRadius, 0)).rotate(Math.PI / 16);
    const endVec = (new Vector(this.innerRadius, 0)).rotate(Math.PI * 7 / 16)
    const outerVec = innerVec.add(new Vector(this.ringThickness, 0));
    const endOuterVec = endVec.add(new Vector(0, this.ringThickness));
    const outerRadius = outerVec.mag();

    ctx.fillStyle = "#FF0000";
    ctx.strokeStyle = "#0000FF";
    for (let i = 0; i < 4; ++i) {
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
  }
}

export default RadialMenu;