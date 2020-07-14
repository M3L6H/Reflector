import RadialMenu from './radial_menu.js';
import Vector from '../physics/vector.js';

class UI {
  constructor(unit) {
    this.towerMenu = new RadialMenu([], new Vector(100, 100));
  }

  update({ unit }) {
    this.towerMenu.update(...arguments);
  }
}

export default UI;