const start = Date.now();
setTimeout(() => console.log(`timer fired after ${Date.now() - start}ms`), 100);
while (Date.now() - start < 500) {}   // blocks the event loop
