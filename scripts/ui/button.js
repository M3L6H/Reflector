import Collider from '../physics/collider.js';

class Button extends Collider {
  constructor(pos, points, zIndex, onClick) {
    super(pos, 0, points, `ui-${ zIndex }`);
    this.zIndex = zIndex;
    this.onClick = onClick;
    console.log(this.vertices);
  }

  // Dummy update to overwrite Collider update
  update({ debug, ctx }) {
    if (debug) {
      ctx.save();
      ctx.strokeStyle = "#00FF00";
      ctx.beginPath();
      const len = this.vertices.length;
      ctx.moveTo(this.vertices[len - 1].x, this.vertices[len - 1].y);
      for (let i = 0; i < len; ++i) {
        ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }
}

export default Button;