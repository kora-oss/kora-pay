// Tiered per-seat pricing, in major currency units (e.g. dollars / naira / pounds).
const TIERS = { free: 0, pro: 10, team: 8 };

const CURRENCY_SYMBOLS = {
  USD: '$',
  NGN: '₦',
  GBP: '£',
  EUR: '€',
  GHS: 'GH₵',
  KES: 'KSh',
};

function calculatePrice(plan, seats) {
  if (!(plan in TIERS)) throw new Error(`Unknown plan: ${plan}`);
  if (typeof seats !== 'number' || seats < 0) throw new Error('seats must be a non-negative number');
  if (seats === 0) return 0;
  const unit = seats > 10 ? TIERS[plan] * 0.9 : TIERS[plan];   // 10% volume discount
  return Math.round(unit * seats * 100) / 100;                    // round to cents
}

function formatCurrency(amount, currency = 'USD') {
  const code = (currency || 'USD').toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] || `${code} `;
  const formattedNumber = Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formattedNumber}`;
}

module.exports = { calculatePrice, formatCurrency, TIERS, CURRENCY_SYMBOLS };
