import Renderer from './renderer.js';

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
  
  // Let all the elements of the game know we have finished initialization
  const init = new CustomEvent("Init", { detail: { unit, width, height } });
  document.dispatchEvent(init);
  window.requestAnimationFrame(render);
};

import Collider from './physics/collider.js';
import Vector from './physics/vector.js';

let c1 = new Collider(new Vector(0, 0), Math.PI / 6, [new Vector(-10, 10), new Vector(10, 10), new Vector(10, -10), new Vector(-10, -10)], "ui");
let c2 = new Collider(new Vector(500, 250), 0, [new Vector(-10, 10), new Vector(10, 10), new Vector(10, -10), new Vector(-10, -10)], "ui");

let start = 0;

// Render loop
const render = (time) => {
  const delta = (!start && 0) + (start && (time - start));
  start = time;

  ctx.fillStyle = "#D3D0CB";
  ctx.fillRect(0, 0, width, height);

  c1.updatePos(new Vector(mouseX || 0, mouseY || 0));

  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = "#FF0000";
  ctx.moveTo(c1.pos.x, c1.pos.y);
  c1.vertices.forEach(vert => {
    ctx.lineTo(vert.x, vert.y);
  });
  ctx.lineTo(c1.vertices[0].x, c1.vertices[0].y);
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = "#00FF00";
  ctx.moveTo(c2.pos.x, c2.pos.y);
  c2.vertices.forEach(vert => {
    ctx.lineTo(vert.x, vert.y);
  });
  ctx.lineTo(c2.vertices[0].x, c2.vertices[0].y);
  ctx.stroke();
  if (c1.collisions.length > 0) {
    ctx.beginPath();
    ctx.strokeStyle = "#0000FF";
    ctx.moveTo(c1.pos.x, c1.pos.y);
    ctx.lineTo(c1.collisions[0].penetration.x + c1.pos.x, c1.collisions[0].penetration.y + c1.pos.y);
    ctx.stroke();
  }
  if (c2.collisions.length > 0) {
    ctx.beginPath();
    ctx.strokeStyle = "#0000FF";
    ctx.moveTo(c2.pos.x, c2.pos.y);
    ctx.lineTo(c2.collisions[0].penetration.x + c2.pos.x, c2.collisions[0].penetration.y + c2.pos.y);
    ctx.stroke();
  }
  ctx.restore();
  
  const update = new CustomEvent("Update", { detail: { canvas, delta, ctx, width, height, unit, mouseX, mouseY } });
  document.dispatchEvent(update);
  window.requestAnimationFrame(render);
};

document.addEventListener("DOMContentLoaded", () => {
  initialize();
});

document.addEventListener("Init", ({ detail }) => {
  // new Renderer(detail.unit);
});