const { StripeAdapter, PaystackAdapter } = require('./gateways');

class KoraPay {
  constructor(config = {}) {
    this.adapters = [];
    this.processedEvents = new Set(); // In-memory deduplication cache

    if (config.stripe) {
      this.adapters.push(new StripeAdapter(config.stripe.apiKey, config.stripe.webhookSecret));
    }
    if (config.paystack) {
      this.adapters.push(new PaystackAdapter(config.paystack.apiKey, config.paystack.webhookSecret));
    }
  }

  /**
   * Intelligently selects the best gateway for the requested currency
   */
  resolveGateway(currency) {
    const curr = (currency || 'USD').toUpperCase();
    const adapter = this.adapters.find(a => a.supportsCurrency(curr));
    if (!adapter) {
      throw new Error(`No configured gateway supports currency: ${curr}`);
    }
    return adapter;
  }

  /**
   * Calculate plan pricing with seat volume discounting
   */
  calculatePlanTotal(plan, seats) {
    if (seats < 1) throw new Error('seats must be at least 1');
    const TIERS = { free: 0, pro: 10, team: 8 };
    if (!(plan in TIERS)) throw new Error(`Unknown plan: ${plan}`);
    const unit = seats > 10 ? TIERS[plan] * 0.9 : TIERS[plan];
    return Math.round(unit * seats * 100) / 100;
  }

  /**
   * Universal Checkout Initialization
   */
  async initializeCheckout({ plan = 'pro', seats = 1, currency = 'USD', email, metadata = {} }) {
    if (!email) throw new Error('Customer email is required');
    const gateway = this.resolveGateway(currency);
    const amount = this.calculatePlanTotal(plan, seats);
    const orderId = `kp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return {
      orderId,
      gateway: gateway.name,
      currency: currency.toUpperCase(),
      amount,
      plan,
      seats,
      customerEmail: email,
      status: 'pending',
      metadata,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Universal Idempotent Webhook Handler
   */
  async handleWebhook({ gatewayName, rawPayload, signature }) {
    const adapter = this.adapters.find(a => a.name === gatewayName);
    if (!adapter) throw new Error(`Unknown gateway: ${gatewayName}`);

    // 1. Signature Verification
    const isValid = adapter.verifyWebhook(rawPayload, signature);
    if (!isValid) throw new Error(`Invalid signature for gateway: ${gatewayName}`);

    // 2. Normalization
    const payment = adapter.normalizeWebhook(rawPayload);
    if (!payment) return { handled: false, reason: 'Ignored or unsupported event type' };

    // 3. Idempotency Guard (protect against duplicate delivery)
    if (this.processedEvents.has(payment.id)) {
      return { handled: true, duplicate: true, payment };
    }
    this.processedEvents.add(payment.id);

    return {
      handled: true,
      duplicate: false,
      payment,
    };
  }
}

module.exports = { KoraPay };
