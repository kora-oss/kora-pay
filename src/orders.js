// Order state machine: pending -> paid -> fulfilled. Emits 'status' on every change.
const { EventEmitter } = require('events');

const NEXT = { pending: ['paid'], paid: ['fulfilled'], fulfilled: [] };

class Order extends EventEmitter {
  constructor(id) {
    super();
    this.id = id;
    this.status = 'pending';
    this.history = [{ status: 'pending', at: Date.now() }];
  }

  setStatus(status) {
    if (!NEXT[this.status].includes(status)) throw new Error(`Cannot go from ${this.status} to ${status}`);
    this.status = status;
    this.history.push({ status, at: Date.now() });
    this.emit('status', status);
  }
}

// A tiny in-memory store so the tests have something real to talk to.
const orders = new Map();
let nextId = 1;

async function createOrder() {
  const order = new Order(String(nextId++));
  orders.set(order.id, order);
  return order;
}

async function getOrder(id) {
  return orders.get(id);
}

// Webhooks are processed asynchronously, after a variable delay (like a real queue).
async function sendWebhook(id, type) {
  const order = orders.get(id);
  if (!order) throw new Error(`No order ${id}`);
  const delay = Math.floor(Math.random() * 80);
  setTimeout(() => { if (type === 'payment.succeeded') order.setStatus('paid'); }, delay);
}

// Resolves when the order reaches `status`, or rejects after `timeout` ms.
function waitForStatus(order, status, { timeout = 2000 } = {}) {
  if (order.status === status) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { order.off('status', onStatus); reject(new Error(`Timed out waiting for ${status}`)); }, timeout);
    function onStatus(s) { if (s === status) { clearTimeout(timer); order.off('status', onStatus); resolve(); } }
    order.on('status', onStatus);
  });
}

module.exports = { Order, createOrder, getOrder, sendWebhook, waitForStatus };
