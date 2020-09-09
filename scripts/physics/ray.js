import Collider from './collider.js';
import Vector from "./vector.js";

const precision = 0.01;

class Ray extends Collider {
  constructor(pos, dir, layer="ray") {
    super(pos, 0, [dir.unit()], layer);
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

  updateDir(dir) {
    this.model = [dir.unit()];
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
    this.collisions = []; // Track all the collisions we encounter
    this.steps = [];
    this.numCollisions = 0;

    // We use the first vector in our model as the direction
    let dir = this.model[0].unit();
    let dist = 0;
    let point = this.pos;

    // Apply the first step of the ray marching algorithm
    // Calculate the minimum distance to the closest collider
    let min = this.minDistToLine(point);

    let steps = 1000; // We don't want the algorithm to continue forever

    // We cap the ray both on distance and number of steps
    while (dist < 10000 && steps > 0) {
      steps--;
      this.steps.push([point, min]);

      // min represents the distance to our closest collider
      // If it is less than some threshold, we consider ourselves to be colliding
      // Using a threshold is important to prevent accidentally going through a
      // collider instead of bouncing off it
      if (min <= precision) {
        let exit = true; // Assume we are done tracing

        // Iterate through our most recent collisions
        this.lastHits.forEach(lastCollision => {
          const lastHit = lastCollision.colliderHit;
          // We only collide with colliders in the specified bounce layer
          if (lastHit.layer === bounceLayer) {
            exit = false; // We collided, so we must continue calculating

            // Get the endpoints of the edge we collided with
            const [a, b] = lastCollision.edgeHit;
            
            // Calculate the vector representing the edge
            const edge = a.sub(b);
            let norm = edge.normal(); // Get the normal of said edge

            // To avoid issues with flipped normals
            if (norm.dot(dir) > 0) {
              norm = norm.inv();
            }

            // Calculate the bounce direction
            let newDir = dir.vectorProj(edge).sub(dir.vectorProj(norm));
  
            dir = newDir.unit(); // Set the bounce direction

            // Increase the current min enough to "escape" the current edge
            if (min <= precision) min = 5 * precision;
          }
        });

        if (exit) break; // Stop calculating if we did not collide
      }

      // Step in the current direction by the current minimum
      point = point.add(dir.scale(min));
      dist += min; // Add to our distance
      min = this.minDistToLine(point); // Recalculate the minimum distance
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