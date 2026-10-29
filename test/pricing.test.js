const { calculatePrice } = require('../src/pricing');

test('pro, 5 seats', () => expect(calculatePrice('pro', 5)).toBe(50));
test('unknown plan throws', () => expect(() => calculatePrice('gold', 1)).toThrow());
