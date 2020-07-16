export default (cb, timeout) => {
  let invoked = false;
  return function () {
    if (!invoked) {
      cb(...arguments);
      invoked = true;
      setTimeout(() => invoked = false, timeout);
    }
  };
}