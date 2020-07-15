import Collider from '../physics/collider.js';

class Button {
  constructor(pos, points, zIndex) {
    this.collider = new Collider(pos, 0, points, "ui");
    this.zIndex = zIndex;
  }
}

export default Button;