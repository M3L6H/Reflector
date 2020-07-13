import Tile from "./tiles/reflector.js";
import Placeable from './tiles/obstacle.js';

const createErrorMsg = (body) => {
  const msg = document.createElement("p");
  msg.classList.add("error");
  msg.appendChild(document.createTextNode(`Sorry, ${ body }`));
  return msg;
}

let canvas, ctx, width, height, unit, mouseX, mouseY;

// Initialization
const initialize = () => {
  const root = document.getElementById("root");
  
  const winWidth = window.innerWidth, winHeight = window.innerHeight;
  
  if (winWidth < 800) {
    root.appendChild(createErrorMsg("your screen is not wide enough to play this game!"));
    return;
  } else {
    unit = Math.floor(winWidth / 20);
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
  
  // Let all the elements of the game know we have finished initialization
  const init = new CustomEvent("Init", { detail: { unit, width, height } });
  document.dispatchEvent(init);
  window.requestAnimationFrame(render);
};

let start = 0;

// Render loop
const render = (time) => {
  const delta = (!start && 0) + (start && (time - start));
  start = time;

  ctx.fillStyle = "#D3D0CB";
  ctx.fillRect(0, 0, width, height);
  
  const update = new CustomEvent("Update", { detail: { canvas, delta, ctx, width, height, unit } });
  document.dispatchEvent(update);
  window.requestAnimationFrame(render);
};

document.addEventListener("DOMContentLoaded", () => {
  initialize();
});

const elts = [];

document.addEventListener("Init", ({ detail }) => {
  elts.push(new Tile(0, 0, detail.unit, 0b10000));
  elts.push(new Tile(0, detail.unit, detail.unit, 0b01000));
  elts.push(new Tile(detail.unit, 0, detail.unit, 0b00100));
  elts.push(new Tile(detail.unit, detail.unit, detail.unit, 0b00010));
  elts.push(new Placeable(detail.unit * 2, detail.unit, detail.unit));
  elts.push(new Placeable(detail.unit * 3, detail.unit, detail.unit));
});

document.addEventListener("Update", ({ detail }) => {
  elts.forEach(elt => {
    elt.update({ ...detail, mouseX, mouseY });
  });
});