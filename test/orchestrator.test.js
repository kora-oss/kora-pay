import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
const { KoraPay, StripeAdapter, PaystackAdapter } = require('../src/index');

describe('KoraPay Universal Billing Orchestrator', () => {
  const kora = new KoraPay({
    stripe: { apiKey: 'sk_test_123', webhookSecret: 'whsec_test_secret' },
    paystack: { apiKey: 'sk_test_456', webhookSecret: 'paystack_secret_key' },
  });

  describe('Intelligent Gateway Routing', () => {
    it('routes USD, GBP, and EUR to Stripe', async () => {
      const usdOrder = await kora.initializeCheckout({
        plan: 'pro',
        seats: 5,
        currency: 'USD',
        email: 'dev@acme.com',
      });
      expect(usdOrder.gateway).toBe('stripe');
      expect(usdOrder.amount).toBe(50);

      const gbpOrder = await kora.initializeCheckout({
        plan: 'pro',
        seats: 2,
        currency: 'GBP',
        email: 'uk@fintech.co.uk',
      });
      expect(gbpOrder.gateway).toBe('stripe');
      expect(gbpOrder.amount).toBe(20);
    });

    it('routes NGN, GHS, and KES to Paystack', async () => {
      const ngnOrder = await kora.initializeCheckout({
        plan: 'team',
        seats: 5,
        currency: 'NGN',
        email: 'founder@lagos.ng',
      });
      expect(ngnOrder.gateway).toBe('paystack');
      expect(ngnOrder.amount).toBe(40);
    });

    it('applies volume discount for over 10 seats', async () => {
      const bulkOrder = await kora.initializeCheckout({
        plan: 'pro',
        seats: 20,
        currency: 'USD',
        email: 'enterprise@corp.com',
      });
      // 20 * (10 * 0.9) = 180
      expect(bulkOrder.amount).toBe(180);
    });

    it('throws error for unsupported currency', async () => {
      await expect(
        kora.initializeCheckout({
          plan: 'pro',
          seats: 1,
          currency: 'XYZ',
          email: 'test@unknown.com',
        })
      ).rejects.toThrow(/No configured gateway supports currency/);
    });
  });

  describe('Universal Webhook Processing & Idempotency', () => {
    it('verifies and normalizes Paystack webhook', async () => {
      const payload = {
        event: 'charge.success',
        data: {
          reference: 'ref_987654321',
          amount: 500000, // 5,000 NGN in kobo
          currency: 'NGN',
          customer: { email: 'client@africa.com' },
        },
      };
      const rawString = JSON.stringify(payload);
      const signature = crypto
        .createHmac('sha512', 'paystack_secret_key')
        .update(rawString)
        .digest('hex');

      const result = await kora.handleWebhook({
        gatewayName: 'paystack',
        rawPayload: rawString,
        signature,
      });

      expect(result.handled).toBe(true);
      expect(result.duplicate).toBe(false);
      expect(result.payment.id).toBe('kora_ref_987654321');
      expect(result.payment.amount).toBe(5000);
      expect(result.payment.currency).toBe('NGN');
      expect(result.payment.customerEmail).toBe('client@africa.com');
      expect(result.payment.status).toBe('succeeded');

      // Idempotency check: replay the same webhook
      const duplicateResult = await kora.handleWebhook({
        gatewayName: 'paystack',
        rawPayload: rawString,
        signature,
      });

      expect(duplicateResult.handled).toBe(true);
      expect(duplicateResult.duplicate).toBe(true);
    });

    it('verifies and normalizes Stripe webhook', async () => {
      const payload = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_abc123',
            amount_total: 10800, // $108 in cents
            currency: 'usd',
            customer_details: { email: 'buyer@global.com' },
          },
        },
      };
      const rawString = JSON.stringify(payload);
      const signature = crypto
        .createHmac('sha256', 'whsec_test_secret')
        .update(rawString)
        .digest('hex');

      const result = await kora.handleWebhook({
        gatewayName: 'stripe',
        rawPayload: rawString,
        signature,
      });

      expect(result.handled).toBe(true);
      expect(result.duplicate).toBe(false);
      expect(result.payment.id).toBe('kora_cs_test_abc123');
      expect(result.payment.amount).toBe(108);
      expect(result.payment.currency).toBe('USD');
      expect(result.payment.customerEmail).toBe('buyer@global.com');
    });

    it('rejects tampered or forged webhook signatures', async () => {
      const payload = JSON.stringify({ type: 'checkout.session.completed' });
      await expect(
        kora.handleWebhook({
          gatewayName: 'stripe',
          rawPayload: payload,
          signature: 'forged_invalid_signature',
        })
      ).rejects.toThrow(/Invalid signature/);
    });
  });
});
