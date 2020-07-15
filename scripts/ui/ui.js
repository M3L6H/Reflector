import RadialMenu from './radial_menu.js';
import Vector from '../physics/vector.js';
import Ray from "../physics/ray.js";

class UI {
  constructor(canvas) {
    this.zIndex = 0;
    this.layers = [];
    this.canvas = canvas;
    // this.towerMenu = new RadialMenu([], new Vector(100, 100));

    this.canvas.addEventListener("click", this.handleClick.bind(this));
    this.mouseRay = new Ray(new Vector(0, 0), new Vector(1, 0));
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    this.mouseRay.updatePos(new Vector(mouseX, mouseY));
    this.mouseRay.layer = `ui-${ this.zIndex }`;
    this.mouseRay.cast();

    let numCollisions = new Map();
    for (let i = 0; i < this.mouseRay.numCollisions; ++i) {
      const rayhit = this.mouseRay.collisions[i];
      numCollisions.set(rayhit.colliderHit, (numCollisions.get(rayhit.colliderHit) || 0) + 1);
    }

    for (let [button, numCol] of numCollisions) {
      if (numCol % 2 === 1) {
        button.onClick();
      }
    }
  }

  update({ unit }) {
    // this.towerMenu.update(...arguments);
  }
}

export default UI;