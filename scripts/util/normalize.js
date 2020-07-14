export default ([x, y]) => (
  [x / (Math.sqrt(x * x + y * y)), y / (Math.sqrt(x * x + y * y))]
);