class Collider {
  static layers = {
    reflectors: [],
    lasers: [],
    enemies: []
  };
  static layerMasks = {
    reflectors: { reflectors: false, lasers: true, enemies: false },
    lasers: { lasers: false, reflectors: true, enemies: true },
    enemies: { enemies: false, reflectors: false, lasers: true }
  };
  
  constructor(pos, rot, model, layer=1) {
    this.pos = pos;
    this.rot = rot;
    this.model = model;
    this.layer = layer;
    
    this.updateVertices();
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
        Collider.layerMasks[mask][this.layer] = true;
        layerMask[mask] = true;
      }

      Collider.layerMasks[this.layer] = layerMask;
    }
  }

  // Implementation of Separated Axis Theorem
  isCollidingWith(other) {
    let collider1 = this;
    let collider2 = other;

    for (let i = 0; i < 2; ++i) {
      const numVerts = collider1.vertices.length;
      
      for (let v = 0; v < numVerts; ++v) {
        const vec = collider1.vertices[(v + 1) % numVerts].sub(collider1.vertices[v]);
        const norm = vec.normal();

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

        if (!(max1 > min2 && min1 < max2)) {
          return false;
        }
      }
      
      collider1 = other;
      collider2 = this;
    }

    return true;
  }
}

export default Collider;