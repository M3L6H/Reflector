import Map from './map.js';
import Level1 from '../maps/01.js';
import UI from './ui/ui.js';

// Handles the rendering order. Keeps index clean
class Renderer {
  constructor(unit, canvas, width, height) {
    this.map = new Map(Level1, unit, width, height);
    this.ui = new UI(canvas, unit, this.map.money);

    document.addEventListener("Update", ({ detail }) => this.render(detail));
  }

  render(detail) {
    this.map.update(detail);
    this.ui.update(detail, this.map.money);
    const physicsEvent = new CustomEvent("PhysicsUpdate", { detail });
    document.dispatchEvent(physicsEvent);
  }
}

export default Renderer;