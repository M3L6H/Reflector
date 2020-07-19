import Map from './map.js';
import Level1 from '../maps/01.js';
import UI from './ui/ui.js';

const levels = [
  Level1
];

// Handles the rendering order. Keeps index clean
class Renderer {
  constructor(unit, canvas, width, height) {
    this.unit = unit;
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    
    this.map = new Map(Level1, unit, width, height);
    this.ui = new UI(canvas, unit, this.map.money);

    document.addEventListener("Update", ({ detail }) => this.render(detail));
  }

  changeLevel(level) {
    this.map = new Map(levels[level], this.unit, this.width, this.height);
    this.ui = new UI(this.canvas, this.unit, this.map.money);
  }

  render(detail) {
    if (this.map.health <= 0) {
      const ctx = detail.ctx;
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, 0, detail.width, detail.height);
      ctx.font = `24px sans-serif`;
      ctx.textAlign = "center";
      ctx.translate(detail.width / 2, detail.height / 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("You Lost.", 0, 0);
      ctx.fillText("Please select a level from the list to play again.", 0, 24, detail.width);
      ctx.restore();
      return;
    }
    
    this.map.update(detail);
    this.ui.update(detail, this.map.money);
    const physicsEvent = new CustomEvent("PhysicsUpdate", { detail });
    document.dispatchEvent(physicsEvent);
  }
}

export default Renderer;