import clamp from './clamp.js';

export default (a, b, t) => (
  a * (1 - clamp(t)) + b * clamp(t)
);