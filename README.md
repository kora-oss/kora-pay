<p align="center">
  <img src="https://raw.githubusercontent.com/kora-oss/.github/main/profile/kora-oss-banner.jpg" alt="Kora Pay Banner" width="100%">
</p>

<p align="center">
  <a href="https://github.com/kora-oss/kora-pay/actions"><img src="https://img.shields.io/badge/build-passing-34d399?style=flat-square" alt="Build Status"></a>
  <a href="https://github.com/kora-oss/kora-pay/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-38bdf8?style=flat-square" alt="License"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D20-818cf8?style=flat-square" alt="Node Version"></a>
  <a href="https://skill.sch/open-source"><img src="https://img.shields.io/badge/course-SKILL.SCH-c084fc?style=flat-square" alt="SKILL.SCH"></a>
</p>

# kora-pay

> **Universal Cross-Border Billing & Multi-Rail Payment Orchestrator for Node.js.**  
> Seamlessly orchestrate global payments (Stripe) and emerging market rails (Paystack / Mobile Money) with unified seat-based pricing, cryptographic webhook normalization, and atomic idempotency.

---

## 🌟 Why Kora Pay?

Most modern SaaS applications and digital platforms operate globally, but traditional billing software is heavily fragmented:
* **Global Cards (US/UK/EU):** Handled via **Stripe** (`USD`, `GBP`, `EUR`).
* **African & Emerging Markets:** Handled via **Paystack / Flutterwave** (`NGN`, `GHS`, `KES`, `ZAR`, Bank Transfers, USSD, MoMo).

`kora-pay` collapses this entire dual-gateway headache into **one unified, intelligent API**:
1. **Dynamic Smart Routing:** Automatically detects currency & country to route transactions through the rail with the highest authorization rate and lowest fee.
2. **Unified Webhook Normalization:** Normalizes disparate gateway payloads into an immutable `UnifiedPayment` schema.
3. **Atomic Idempotency:** Built-in HMAC signature verification and deduplication locks to mathematically prevent double-charging or missed fulfillment.
4. **Volume Seat Discounting:** Automated tiered pricing calculation for seat-based B2B software.

---

## 🚀 Quickstart

### 1. Installation
```bash
npm install kora-pay
```

### 2. Initialize the Orchestrator
```javascript
const { KoraPay } = require('kora-pay');

const kora = new KoraPay({
  stripe: {
    apiKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  paystack: {
    apiKey: process.env.PAYSTACK_SECRET_KEY,
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET,
  },
});
```

### 3. Initialize Dynamic Checkout
```javascript
// Automatically routes USD/GBP to Stripe
const usOrder = await kora.initializeCheckout({
  plan: 'pro',
  seats: 5,
  currency: 'USD',
  email: 'cto@acme.com',
});
console.log(usOrder.gateway); // -> 'stripe'
console.log(usOrder.amount);  // -> 50 ($50.00)

// Automatically routes NGN/KES to Paystack with volume discounts
const ngOrder = await kora.initializeCheckout({
  plan: 'team',
  seats: 12,
  currency: 'NGN',
  email: 'founder@lagos-tech.ng',
});
console.log(ngOrder.gateway); // -> 'paystack'
console.log(ngOrder.amount);  // -> 86.4 (Volume discount applied)
```

### 4. Unified Webhook Ingestion (Idempotent & Safe)
```javascript
app.post('/webhooks/:gateway', async (req, res) => {
  try {
    const result = await kora.handleWebhook({
      gatewayName: req.params.gateway, // 'stripe' or 'paystack'
      rawPayload: req.body,
      signature: req.headers['x-paystack-signature'] || req.headers['stripe-signature'],
    });

    if (result.duplicate) {
      return res.status(200).send('Event already processed');
    }

    if (result.handled) {
      console.log('Payment Succeeded:', result.payment.id, result.payment.amount, result.payment.currency);
      // Fulfill order, update DB, grant access
    }

    res.status(200).json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook error: ${err.message}`);
  }
});
```

---

## 💻 CLI

Get an instant pricing quote without writing any code:

```bash
# From npm (no install required)

npx kora-pay quote --plan=pro --seats=15 --currency=NGN

# From a local clone

node bin/kora-pay.js quote --plan=pro --seats=15 --currency=NGN
```

```
--------------------------------------------
💳 Kora Pay Pricing Quote
--------------------------------------------
Plan:       pro
Seats:      15 (10% volume discount applied)
Unit Price: ₦9.00
Total:      ₦135.00
--------------------------------------------
```

| Flag | Short | Description |
| --- | --- | --- |
| `--plan` | `-p` | Plan to quote: `free`, `pro`, or `team` (required) |
| `--seats` | `-s` | Number of seats; non-negative integer (required) |
| `--currency` | `-c` | ISO currency code used for formatting (default: `USD`) |
| `--help` | `-h` | Show usage information |
| `--version` | `-v` | Show the installed version |

---

## 🧪 Testing & Event Loop Drills

`kora-pay` also serves as a benchmark training repository for the **[SKILL.SCH Open Source Contributor & Maintainer course](https://skill.sch/open-source)**.

```bash
# Run the test suite
npm test

# Run integration tests against real PostgreSQL 16
docker compose up -d
npm run test:integration

# Event-loop concurrency drills
node phases.js
```

---

## 🤝 Contributing

We welcome open-source contributions from engineers worldwide!  
Check out our open issues:
* **[#1: Zero seats edge-case validation](https://github.com/kora-oss/kora-pay/issues/1)**
* **[#2: Support NGN currency formatting](https://github.com/kora-oss/kora-pay/issues/2)**
* **[#4: TypeScript definitions and interfaces](https://github.com/kora-oss/kora-pay/issues/4)**

---

## 📄 License

MIT © [Kora OSS](https://github.com/kora-oss)
