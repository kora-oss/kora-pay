const { calculatePrice, formatCurrency } = require('../src/pricing');

test('pro, 5 seats', () => expect(calculatePrice('pro', 5)).toBe(50));
test('0 seats returns 0', () => expect(calculatePrice('pro', 0)).toBe(0));
test('negative seats throws error', () => expect(() => calculatePrice('pro', -1)).toThrow());
test('unknown plan throws', () => expect(() => calculatePrice('gold', 1)).toThrow());

test('formats USD correctly', () => {
  expect(formatCurrency(50, 'USD')).toBe('$50.00');
  expect(formatCurrency(1250.5, 'USD')).toBe('$1,250.50');
});

test('formats NGN (Nigerian Naira) correctly', () => {
  expect(formatCurrency(50, 'NGN')).toBe('₦50.00');
  expect(formatCurrency(50000, 'NGN')).toBe('₦50,000.00');
});

test('formats GBP and EUR correctly', () => {
  expect(formatCurrency(25, 'GBP')).toBe('£25.00');
  expect(formatCurrency(100, 'EUR')).toBe('€100.00');
});
