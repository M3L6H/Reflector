import Map from './map.js';
import Level1 from '../maps/01.js';
import Level2 from '../maps/02.js';
import UI from './ui/ui.js';

const levels = [
  Level1,
  Level2
];

// Handles the rendering order. Keeps index clean
class Renderer {
  constructor(unit, canvas, width, height, setUpLevelSelect) {
    this.unit = unit;
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.setUpLevelSelect = setUpLevelSelect;
    this.gameOver = false;
    this.level = localStorage.getItem("level") || 0;
    
    this.map = new Map(levels[this.level], unit, width, height);
    this.ui = new UI(canvas, unit, this.map.money);

    document.addEventListener("Update", ({ detail }) => this.render(detail));

    const restartButton = document.getElementById("restart-btn");
    restartButton.addEventListener("click", () => {
      this.changeLevel(this.level);
    });
  }

  changeLevel(level) {
    localStorage.setItem("level", level);
    location.reload();
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
      ctx.fillText("Please select a level from the list to play again.", 0, 24);
      ctx.restore();
      return;
    }

    if (this.map.enemies.length === 0 && Object.keys(this.map.spawnList).length === 0) {
      const ctx = detail.ctx;
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, 0, detail.width, detail.height);
      ctx.font = `24px sans-serif`;
      ctx.textAlign = "center";
      ctx.translate(detail.width / 2, detail.height / 2);
      ctx.fillStyle = "#FFFFFF";
      let stars = 3 - Math.ceil((this.map.maxHealth - this.map.health) / this.map.maxHealth * 2);
      
      ctx.fillText("You Won!", 0, 0);
      ctx.fillText("Please select another level from the list below.", 0, 48);

      for (let i = 0; i < 3; ++i) {
        ctx.fillStyle = i < stars ? "#F5EC42" : "rgba(0, 0, 0, 0)";
        ctx.strokeStyle = "#000000";
        ctx.save();
        ctx.translate(i < 1 ? -30 : (i > 1 ? 30 : 0), 14);
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(8, 12);
        ctx.lineTo(-12, -2);
        ctx.lineTo(12, -2);
        ctx.lineTo(-8, 12);
        ctx.lineTo(0, -12);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      if (!this.gameOver) {
        this.gameOver = true;
        localStorage.setItem(`level-${ this.level + 1 }`, stars);
        this.setUpLevelSelect();
      }
      return;
    }

    this.map.update(detail);
    this.ui.update(detail, this.map.money);
    const physicsEvent = new CustomEvent("PhysicsUpdate", { detail });
    document.dispatchEvent(physicsEvent);
  }
}

export default Renderer;