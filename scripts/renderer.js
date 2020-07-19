import Map from './map.js';
import Level1 from '../maps/01.js';
import Level2 from '../maps/02.js';
import Level3 from '../maps/03.js';
import UI from './ui/ui.js';

const levels = [
  Level1,
  Level2,
  Level3
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
    this.level = parseInt(localStorage.getItem("level")) || 0;
    this.star = new Image();
    this.star.src = "https://upload.wikimedia.org/wikipedia/commons/6/63/Star%2A.svg";
    
    this.map = new Map(levels[this.level], unit, width, height);
    this.ui = new UI(canvas, unit, this.map.money);

    document.addEventListener("Update", ({ detail }) => this.render(detail));

    const restartButton = document.getElementById("restart-btn");
    restartButton.addEventListener("click", () => {
      this.changeLevel(this.level);
    });
  }

  changeLevel(level) {
    this.level = parseInt(level);
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

      for (let i = 0; i < stars; ++i) {
        ctx.save();
        ctx.translate(i < 1 ? -30 : (i > 1 ? 30 : 0), 14);
        ctx.drawImage(this.star, -12, -12, 24, 24);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      if (!this.gameOver) {
        this.gameOver = true;
        const currentStars = localStorage.getItem(`level-${ this.level + 1 }`) || 0;
        localStorage.setItem(`level-${ this.level + 1 }`, Math.max(stars, parseInt(currentStars)));
        this.setUpLevelSelect();
      }
    }

    this.map.update({ ...detail, paused: this.gameOver || detail.paused });
    this.ui.update({ ...detail, paused: this.gameOver || detail.paused }, this.map.money);

    if (!detail.paused && !this.gameOver) {
      const physicsEvent = new CustomEvent("PhysicsUpdate", { detail });
      document.dispatchEvent(physicsEvent);
    }
  }
}

export default Renderer;