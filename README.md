<h1 align="center">Reflector</h1>

<h4 align="center">A tower defense game about lasers and reflections.</h4>

#### Table of Contents
- [About](#about)
  - [Live Demo](#live-demo)
- [Technologies](#technologies)
- [Features](#features)
  - [Accurate Collision Detection](#accurate-collision-detection)
  - [Raycasting](#raycasting)

## About

Reflector is a tower defense game where the towers all shoot lasers. Your goal
is to position and aim your lasers in such a way that they reflect off the
silver reflectors around the map and destroy your enemies.

While the premise might sound simple, Reflector's difficulty lies in two places.
Firstly, there are four different kinds of lasers and many different kinds of
enemies. Different lasers do better against different enemies, so studying the
map and the waves is important. Furthermore, money is limited. Often the player
will be required to sell and reposition towers in order to defend from the horde
of enemies.

If you're interested, check out the

### [Live Demo](https://m3l6h.github.io/Reflector/)

## Technologies

This app was built from the ground up with vanilla JavaScript, HTML, and CSS. I
wrote a simple Python script to convert images made in Photoshop into the
JavvaScript code needed, but that is the only exception.

## Features

### Accurate Collision Detection

![Image of collision detection](/images/collisions.png)

Because I did not use any external libraries, I had to roll my own collision
detection system. What I ended up implementing was a form of the Separated Axis
Theorem. I considered using AABB, but wanted to have the ability for arbitrary
polygonal colliders, thus the SAT collision.

```js
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
```

### Raycasting

![Image of raycasting with reflections](/images/reflections.png)

Accurate raycasting and reflections was an essential feature to the game. After
implementing SAT collision, I realized that I would need to separately implement
raycasting. So I did some research and discovered the ray marching algorithm.
I had to make some modifications to the algorithm, since a traditional
raycasting algorithm stops on first contact. I needed mine to bounce, so that
was an additional challenge.

```js
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
```
