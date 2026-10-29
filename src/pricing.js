// Tiered per-seat pricing, in major currency units (e.g. dollars).
const TIERS = { free: 0, pro: 10, team: 8 };

function calculatePrice(plan, seats) {
  if (!(plan in TIERS)) throw new Error(`Unknown plan: ${plan}`);
  if (seats < 1) throw new Error('seats must be at least 1');
  const unit = seats > 10 ? TIERS[plan] * 0.9 : TIERS[plan];   // 10% volume discount
  return Math.round(unit * seats * 100) / 100;                    // round to cents
}

module.exports = { calculatePrice };
