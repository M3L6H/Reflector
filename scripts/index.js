import Renderer from './renderer.js';

const createErrorMsg = (body) => {
  const msg = document.createElement("p");
  msg.classList.add("error");
  msg.appendChild(document.createTextNode(`Sorry, ${ body }`));
  return msg;
}

let canvas, ctx, width, height, unit, mouseX, mouseY, renderer;
let debug = false;
let paused = false;

// Initialization
const initialize = () => {
  setUpLevelSelect();
  
  const root = document.getElementById("canvas");
  
  const winWidth = window.innerWidth, winHeight = window.innerHeight;
  
  if (winWidth < 800) {
    root.appendChild(createErrorMsg("your screen is not wide enough to play this game!"));
    return;
  } else {
    unit = Math.min(Math.floor(winWidth / 20), Math.floor(winHeight / 12));
    const usableWidth = unit * 20;
    const targetHeight = unit * 12;
  
    if (winHeight < targetHeight) {
      root.appendChild(createErrorMsg("your screen is not tall enough to play this game!"));
      return;
    }

    canvas = document.createElement("canvas");
    canvas.width = usableWidth;
    canvas.height = targetHeight;
    canvas.classList.add("canvas");

    ctx = canvas.getContext("2d");
    width = canvas.width;
    height = canvas.height;

    canvas.addEventListener("mousemove", e => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });
    
    root.appendChild(canvas);
  }

  // Set up pause button
  const pauseBtn = document.getElementById("pause-btn");
  pauseBtn.addEventListener("click", () => {
    paused = !paused;

    if (paused) {
      pauseBtn.children[0].classList.remove("fa-pause");
      pauseBtn.children[0].classList.add("fa-play");
    } else {
      pauseBtn.children[0].classList.add("fa-pause");
      pauseBtn.children[0].classList.remove("fa-play");

      window.requestAnimationFrame(render);
    }
  });
  
  // Let all the elements of the game know we have finished initialization
  const init = new CustomEvent("Init", { detail: { unit, width, height, canvas } });
  document.dispatchEvent(init);
  window.requestAnimationFrame(render);
};

const numLevels = 2;
const setUpLevelSelect = () => {
  const levels = document.getElementById("levels");
  levels.innerHTML = "";

  let lastNumStars = 3;

  for (let i = 0; i < numLevels; ++i) {
    const level = document.createElement('div');
    level.classList.add("level");

    if (lastNumStars !== 0) {
      level.addEventListener("click", () => {
        renderer.changeLevel(i);
      });
    } else {
      level.classList.add("locked");
    }

    const image = document.createElement("img");
    image.classList.add("level-thumb");
    image.src = `./maps/${ (i + 1).toString().padStart(2, "0") }.png`;

    level.appendChild(image);

    const stars = document.createElement("div");
    stars.classList.add("stars");

    const numStars = localStorage.getItem(`level-${ i + 1 }`) || 0;
    lastNumStars = numStars;

    for (let i = 0; i < numStars; ++i) {
      const star = document.createElement("img");
      star.classList.add("star");
      star.src = "./images/star.svg";
      stars.appendChild(star);
    }

    level.appendChild(stars);
    
    levels.appendChild(level);
  }
}

// Render loop
let start = 0;
const render = (time) => {
  const delta = (!start && 0) + (start && (time - start));
  start = time;

  if (!paused) {
    ctx.fillStyle = "#D3D0CB";
    ctx.fillRect(0, 0, width, height);
    
    const update = new CustomEvent("Update", { detail: { canvas, delta, ctx, width, height, unit, mouseX, mouseY, debug } });
    document.dispatchEvent(update);
  } else {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.translate(width / 2, height / 2);
    ctx.fillText("Paused", 0, 0);
    ctx.restore();
  }

  window.requestAnimationFrame(render);
};

document.addEventListener("DOMContentLoaded", () => {
  initialize();
});

document.addEventListener("Init", ({ detail: { unit, canvas, width, height } }) => {
  renderer = new Renderer(unit, canvas, width, height, setUpLevelSelect);
});