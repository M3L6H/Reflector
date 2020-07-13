const createErrorMsg = (body) => {
  const msg = document.createElement("p");
  msg.classList.add("error");
  msg.appendChild(document.createTextNode(`Sorry, ${ body }`));
  return msg;
}

// Initialization
const initialize = () => {
  const root = document.getElementById("root");
  
  const winWidth = window.innerWidth, winHeight = window.innerHeight;
  
  if (winWidth < 800) {
    root.appendChild(createErrorMsg("your screen is not wide enough to play this game!"));
    return;
  } else {
    const unit = Math.floor(winWidth / 20);
    const usableWidth = unit * 20;
    const targetHeight = unit * 12;
  
    if (winHeight < targetHeight) {
      root.appendChild(createErrorMsg("your screen is not tall enough to play this game!"));
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = usableWidth;
    canvas.height = targetHeight;
    canvas.classList.add("canvas");
    
    root.appendChild(canvas);
  }
  
  // Let all the elements of the game know we have finished initialization
  const init = new Event("Init", { unit, width: usableWidth, height: targetHeight });
  document.dispatchEvent(init);
};

document.addEventListener("DOMContentLoaded", () => {
  initialize();
});