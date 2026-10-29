const { calculatePrice } = require('./pricing');
const { Order, createOrder, getOrder, sendWebhook, waitForStatus } = require('./orders');
const { KoraPay } = require('./kora');
const { StripeAdapter, PaystackAdapter, UnifiedPayment } = require('./gateways');

module.exports = {
  // Legacy / Drill API
  calculatePrice,
  Order,
  createOrder,
  getOrder,
  sendWebhook,
  waitForStatus,

  // Universal Billing & Orchestration Engine
  KoraPay,
  StripeAdapter,
  PaystackAdapter,
  UnifiedPayment,
};
