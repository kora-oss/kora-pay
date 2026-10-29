const crypto = require('crypto');

/**
 * Standardized Unified Payment Model
 */
class UnifiedPayment {
  constructor({ id, gateway, amount, currency, status, customerEmail, rawReference, metadata = {} }) {
    this.id = id;
    this.gateway = gateway;
    this.amount = amount;
    this.currency = currency.toUpperCase();
    this.status = status; // 'pending' | 'succeeded' | 'failed'
    this.customerEmail = customerEmail;
    this.rawReference = rawReference;
    this.metadata = metadata;
    this.timestamp = Date.now();
  }
}

/**
 * Stripe Adapter for Global Cards, US/EU/UK currencies
 */
class StripeAdapter {
  constructor(apiKey, webhookSecret) {
    this.apiKey = apiKey;
    this.webhookSecret = webhookSecret;
    this.name = 'stripe';
  }

  supportsCurrency(currency) {
    return ['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(currency.toUpperCase());
  }

  verifyWebhook(rawPayload, signature) {
    if (!this.webhookSecret) return true;
    try {
      const expected = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload))
        .digest('hex');
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  normalizeWebhook(event) {
    const parsed = typeof event === 'string' ? JSON.parse(event) : event;
    if (parsed.type === 'checkout.session.completed' || parsed.type === 'payment_intent.succeeded') {
      const data = parsed.data.object;
      return new UnifiedPayment({
        id: `kora_${data.id}`,
        gateway: 'stripe',
        amount: (data.amount || data.amount_total || 0) / 100,
        currency: data.currency,
        status: 'succeeded',
        customerEmail: data.customer_details?.email || data.receipt_email || 'unknown',
        rawReference: data.id,
        metadata: data.metadata || {},
      });
    }
    return null;
  }
}

/**
 * Paystack Adapter for African Currencies (NGN, GHS, KES, ZAR) and Local Rails
 */
class PaystackAdapter {
  constructor(apiKey, webhookSecret) {
    this.apiKey = apiKey;
    this.webhookSecret = webhookSecret;
    this.name = 'paystack';
  }

  supportsCurrency(currency) {
    return ['NGN', 'GHS', 'ZAR', 'KES'].includes(currency.toUpperCase());
  }

  verifyWebhook(rawPayload, signature) {
    if (!this.webhookSecret) return true;
    try {
      const hash = crypto
        .createHmac('sha512', this.webhookSecret)
        .update(typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload))
        .digest('hex');
      return hash === signature;
    } catch {
      return false;
    }
  }

  normalizeWebhook(event) {
    const parsed = typeof event === 'string' ? JSON.parse(event) : event;
    if (parsed.event === 'charge.success') {
      const data = parsed.data;
      return new UnifiedPayment({
        id: `kora_${data.reference}`,
        gateway: 'paystack',
        amount: data.amount / 100,
        currency: data.currency,
        status: 'succeeded',
        customerEmail: data.customer?.email || 'unknown',
        rawReference: data.reference,
        metadata: data.metadata || {},
      });
    }
    return null;
  }
}

module.exports = { StripeAdapter, PaystackAdapter, UnifiedPayment };
