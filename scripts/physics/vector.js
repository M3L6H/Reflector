class Vector {
  // Accept both arrays and individual numbers in the constructor
  constructor(a, b=null) {
    if (b === null)  {
      [this.x, this.y] = a;
    } else {
      this.x = a, this.y = b;
    }
  }

  add(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  sub(other) {
    return new Vector(this.x - other.x, this.y - other.y);
  }

  scale(c) {
    return new Vector(this.x * c, this.y * c);
  }

  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  magSq() {
    return this.x * this.x + this.y * this.y;
  }

  mag() {
    return Math.sqrt(this.magSq());
  }

  unit() {
    const mag = this.mag();
    return new Vector(this.x / mag, this.y / mag);
  }

  angle(other) {
    return Math.acos(this.dot(other) / (this.mag() * other.mag()));
  }

  rotate(angle) {
    return new Vector(Math.cos(angle) * this.x - Math.sin(angle) * this.y,
                      Math.sin(angle) * this.x + Math.cos(angle) * this.y);
  }

  scalarProj(other) {
    return this.dot(other) / other.mag();
  }

  vectorProj(other) {
    return this.scalarProj(other) * other.unit();
  }

  inv() {
    return new Vector(-this.x, -this.y);
  }

  // Returns a vector orthogonal to this one
  normal() {
    return new Vector(-this.y, this.x);
  }
}

export default Vector;