import Collider from './collider.js';

const precision = 0.01;

class Ray extends Collider {
  constructor(pos, dir, layer="ray") {
    super(pos, 0, [dir], layer);
    this.steps = [];
  }

  // Dummy update to overwrite the one in Collider
  update({ ctx, debug }) {
    if (debug) {
      let lastPoint = null;
      ctx.save();
      this.steps.forEach(([point, min]) => {
        lastPoint = lastPoint || point;
        ctx.strokeStyle = "#0000FF";
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        lastPoint = point;
        ctx.beginPath();
        ctx.moveTo(point.x + min, point.y);
        ctx.arc(point.x, point.y, min, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
      });
      ctx.restore();
    }
  }

  // The point is where we are calculating the distance from
  // a and b are the endpoints of the line
  distToLine(p, a, b)
  {
    const ab = b.sub(a);
    if (a.sub(p).dot(ab) > 0 || ab.magSq() === 0) {
      return a.sub(p).mag();
    }

    if (b.sub(p).dot(ab) < 0) {
      return b.sub(p).mag();
    }
    
    const n = ab.normal();
    return Math.abs(a.sub(p).scalarProj(n));
  }

  minDistToLine(point) {
    let min = Infinity;
    this.lastHits = [];

    for (let layer in Collider.layers) {
      if (Collider.layerMasks[this.layer][layer]) {
        Collider.layers[layer].forEach(collider => {
          if (collider === this || !collider.enabled) return;
          let iterations = 0;
          collider.vertices.forEach((vert, idx) => {
            iterations++;

            if (collider.vertices.length === 2 && iterations === 2) {
              return;
            }
            
            const next = collider.vertices[(idx + 1) % collider.vertices.length];
            const dist = this.distToLine(point, vert, next);
            min = Math.min(min, dist);
            if (dist <= precision) {
              const rayHit = new Ray.Hit(this, collider, [vert, next], point);
              this.lastHits.push(rayHit);
              this.collisions.push(rayHit);
              this.numCollisions = this.collisions.length;
            }
          })
        });
      }
    }

    return min;
  }

  // An implementation of ray marching
  cast() {
    this.collisions = [];
    this.steps = [];
    this.numCollisions = 0;
    const dir = this.model[0].unit();
    let dist = 0;
    let point = this.pos;
    let min = this.minDistToLine(point);

    let steps = 1000;

    while (dist < 10000 && steps > 0) {
      steps--;
      this.steps.push([point, min]);
      if (min <= precision) min = 5 * precision; // We want to step through edges we collide with
      point = point.add(dir.scale(min));
      dist += min;
      min = this.minDistToLine(point);
    }
  }

  // Modified ray marching algorithm that bounces around
  bounceCast(bounceLayer) {
    this.collisions = [];
    this.steps = [];
    this.numCollisions = 0;
    let dir = this.model[0].unit();
    let dist = 0;
    let point = this.pos;
    let min = this.minDistToLine(point);

    let steps = 1000;

    while (dist < 10000 && steps > 0) {
      steps--;
      this.steps.push([point, min]);

      if (min <= precision) {
        let exit = true;

        this.lastHits.forEach(lastCollision => {
          const lastHit = lastCollision.colliderHit;
          if (lastHit.layer === bounceLayer) {
            exit = false;
            const [a, b] = lastCollision.edgeHit;
            const edge = a.sub(b);
            let norm = edge.normal();

            if (norm.dot(dir) > 0) {
              norm = norm.inv();
            }

            const ang = dir.angle(norm);
            let newDir = norm.rotate(-Math.PI + ang);
  
            dir = newDir.unit();

            if (min <= precision) min = 5 * precision;
          }
        });

        if (exit) break;
      }

      point = point.add(dir.scale(min));
      dist += min;
      min = this.minDistToLine(point);
    }
  }
}

Ray.Hit = class {
  constructor(ray, colliderHit, edgeHit, hitPoint) {
    this.ray = ray;
    this.colliderHit = colliderHit;
    this.edgeHit = edgeHit;
    this.hitPoint = hitPoint;
  }
}

export default Ray;