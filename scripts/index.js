import Renderer from './renderer.js';

const createErrorMsg = (body) => {
  const msg = document.createElement("p");
  msg.classList.add("error");
  msg.appendChild(document.createTextNode(`Sorry, ${ body }`));
  return msg;
}

let canvas, ctx, width, height, unit, mouseX, mouseY;
let debug = true;

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
  const init = new CustomEvent("Init", { detail: { unit, width, height, canvas } });
  document.dispatchEvent(init);
  window.requestAnimationFrame(render);
};

// import Collider from './physics/collider.js';
// import Vector from './physics/vector.js';
// import Ray from './physics/ray.js';

// let c1 = new Collider(new Vector(300, 400), Math.PI / 6, [new Vector(-100, 100), new Vector(100, 100), new Vector(100, -100), new Vector(-100, -100)], "default");
// let c2 = new Collider(new Vector(400, 300), 0, [new Vector(-150, 150), new Vector(150, 150), new Vector(150, -150), new Vector(-150, -150)], "default");

// document.addEventListener("click", () => {
//   const ray = new Ray(new Vector(mouseX, mouseY), new Vector(1, 0));
//   ray.cast(ctx);
//   console.log(ray.numCollisions);
//   console.log(ray.collisions);

//   let numCollisions = new Map();
//   for (let i = 0; i < ray.numCollisions; ++i) {
//     const rayhit = ray.collisions[i];
//     numCollisions.set(rayhit.colliderHit, (numCollisions.get(rayhit.colliderHit) || 0) + 1);
//   }

//   for (let [collider, numCol] of numCollisions) {
//     if (numCol % 2 === 1) {
//       console.log("Inside of", collider);
//     }
//   }
// });

let start = 0;

// Render loop
const render = (time) => {
  const delta = (!start && 0) + (start && (time - start));
  start = time;

  ctx.fillStyle = "#D3D0CB";
  ctx.fillRect(0, 0, width, height);
  
  const update = new CustomEvent("Update", { detail: { canvas, delta, ctx, width, height, unit, mouseX, mouseY, debug } });
  document.dispatchEvent(update);
  window.requestAnimationFrame(render);
};

document.addEventListener("DOMContentLoaded", () => {
  initialize();
});

document.addEventListener("Init", ({ detail: { unit, canvas } }) => {
  new Renderer(unit, canvas);
});