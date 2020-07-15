import Vector from "./vector.js";

class Collider {
  static layers = {
    reflectors: [],
    lasers: [],
    enemies: [],
    ui: [],
    ray: []
  };
  static layerMasks = {
    reflectors: { reflectors: false, lasers: true, enemies: false, ui: false, ray: false },
    lasers: { lasers: false, reflectors: true, enemies: true, ui: false, ray: false },
    enemies: { enemies: false, reflectors: false, lasers: true, ui: false, ray: false },
    ui: { ui: false, reflectors: false, lasers: false, enemies: false, ray: false },
    ray: { ray: false, ui: true, reflectors: false, lasers: false, enemies: false }
  };
  
  constructor(pos, rot, model, layer="default") {
    this.pos = pos;
    this.rot = rot;
    this.model = model;
    this.layer = layer;
    this.enabled = true;
    this.collisions = [];

    this.updateVertices();
    this.updateLayers();

    document.addEventListener("PhysicsUpdate", ({ detail }) => this.update(detail));
  }

  update() {
    this.collisions = [];
    this.numCollisions = 0;

    if (!this.enabled) return;
    
    for (let layer in Collider.layers) {
      if (Collider.layerMasks[this.layer][layer]) {
        Collider.layers[layer].forEach(collider => {
          if (collider === this || !collider.enabled) return;
          this.isCollidingWith(collider);
        });
      }
    }
  }

  updatePos(pos) {
    this.pos = pos;
    this.updateVertices();
  }

  updateLayer(layer) {
    this.layer = layer;
    this.updateLayers();
  }

  updateVertices() {
    this.vertices = this.model.map(vert => vert.rotate(this.rot).add(this.pos));
  }

  // Creates a new layer if one does not exist and appends this collider to its
  // corresponding layer
  updateLayers() {
    if (Collider.layers[this.layer] !== undefined) {
      Collider.layers[this.layer].push(this);
    } else {
      Collider.layers[this.layer] = [];
      Collider.layers[this.layer].push(this);
      const layerMask = { [this.layer]: true };

      for (let mask in Collider.layerMasks) {
        Collider.layerMasks[mask][this.layer] = false;
        layerMask[mask] = false;
      }

      Collider.layerMasks[this.layer] = layerMask;
    }
  }

  // Implementation of Separated Axis Theorem
  isCollidingWith(other) {
    let collider1 = this;
    let collider2 = other;

    let overlap = Infinity;
    let minimumAxis = null;

    // Calculate collisions
    for (let i = 0; i < 2; ++i) {
      const numVerts = collider1.vertices.length;
      
      for (let v = 0; v < numVerts; ++v) {
        const vec = collider1.vertices[(v + 1) % numVerts].sub(collider1.vertices[v]);
        let norm = vec.normal().unit();
        const diff = other.pos.sub(this.pos);
        if (norm.dot(diff) > 0) {
          norm = norm.inv();
        }

        let max1 = -Infinity;
        let max2 = -Infinity;
        let min1 = Infinity;
        let min2 = Infinity;

        // Collider 1
        collider1.vertices.forEach(vert => {
          const prod = vert.dot(norm);
          max1 = Math.max(max1, prod);
          min1 = Math.min(min1, prod);
        });

        // Collider 2
        collider2.vertices.forEach(vert => {
          const prod = vert.dot(norm);
          max2 = Math.max(max2, prod);
          min2 = Math.min(min2, prod);
        });

        const newOverlap = Math.min(max1, max2) - Math.max(min1, min2);
        if (newOverlap < overlap) {
          overlap = newOverlap;
          minimumAxis = norm;
        }

        if (!(max1 > min2 && min1 < max2)) {
          return false;
        }
      }
      
      collider1 = other;
      collider2 = this;
    }

    this.collisions.push(new Collider.Collision(this, other, overlap, minimumAxis));
    this.numCollisions += 1;

    return true;
  }
}

Collider.Collision = class {
  constructor(collider, collidingWith, overlap, minimumAxis) {
    this.collider = collider;
    this.collidingWith = collidingWith;
    this.overlap = overlap;
    this.minimumAxis = minimumAxis;
    this.penetration = this.minimumAxis.scale(this.overlap);
  }
};

export default Collider;