process.nextTick(() => {
  console.log(1);
  Promise.resolve().then(() => console.log(2));
});
Promise.resolve().then(() => {
  console.log(3);
  process.nextTick(() => console.log(4));
});
setTimeout(() => console.log(5), 0);
