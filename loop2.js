// Top level: which runs first?
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
