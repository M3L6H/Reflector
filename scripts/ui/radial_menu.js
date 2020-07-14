import Vector from '../physics/vector.js';

class RadialMenu {
  constructor(items, pos=new Vector(0, 0)) {
    if (items.length > 4) {
      throw "Radial menu cannot support more than 4 items!";
    }

    this.items = items;
    this.pos = pos;
  }

  setPos(vec) {
    this.pos = vec;
  }

  update({ unit, ctx }) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    const innerRadius = unit / 2;
    const ringThickness = unit;
    const innerVec = (new Vector(innerRadius, 0)).rotate(Math.PI / 16);
    const endVec = (new Vector(innerRadius, 0)).rotate(Math.PI * 7 / 16)
    const outerVec = innerVec.add(new Vector(ringThickness, 0));
    const endOuterVec = endVec.add(new Vector(0, ringThickness));
    const outerRadius = outerVec.mag();

    ctx.fillStyle = "#FF0000";
    ctx.strokeStyle = "#00FF00";
    for (let i = 0; i < 4; ++i) {
      ctx.rotate(Math.PI / 2 * i);
      ctx.beginPath();
      ctx.arc(0, 0, innerRadius, Math.PI / 16, Math.PI * 7 / 16);
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