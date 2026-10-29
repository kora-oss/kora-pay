const fs = require('fs');
console.log('sync     : main script');
setTimeout(() => console.log('timers   : setTimeout'), 0);
fs.readFile(__filename, () => {
  console.log('poll     : readFile callback (I/O)');
  setTimeout(() => console.log('timers   : setTimeout (next turn)'), 0);
  setImmediate(() => console.log('check    : setImmediate'));
  Promise.resolve().then(() => console.log('  between: Promise microtask'));
  process.nextTick(() => console.log('  between: process.nextTick'));
});
