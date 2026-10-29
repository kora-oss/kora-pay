// FLAKY: waits a fixed time and hopes the webhook was processed.
const { createOrder, sendWebhook, getOrder } = require('../src/orders');

test('order becomes paid after webhook', async () => {
  const order = await createOrder();
  await sendWebhook(order.id, 'payment.succeeded');
  await new Promise(r => setTimeout(r, 50));   // <- guess
  expect((await getOrder(order.id)).status).toBe('paid');
});
