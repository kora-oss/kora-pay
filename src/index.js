const { calculatePrice, formatCurrency, TIERS, CURRENCY_SYMBOLS } = require('./pricing');
const { Order, createOrder, getOrder, sendWebhook, waitForStatus } = require('./orders');
const { KoraPay } = require('./kora');
const { StripeAdapter, PaystackAdapter, UnifiedPayment } = require('./gateways');

module.exports = {
  // Core Pricing & Currency Formatting
  calculatePrice,
  formatCurrency,
  TIERS,
  CURRENCY_SYMBOLS,

  // Order State Machine
  Order,
  createOrder,
  getOrder,
  sendWebhook,
  waitForStatus,

  // Multi-Rail Orchestrator
  KoraPay,
  StripeAdapter,
  PaystackAdapter,
  UnifiedPayment,
};
