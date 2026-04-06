// public/timer-worker.js
setInterval(() => {
  postMessage('tick');
}, 1000);