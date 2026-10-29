// Needs a real Postgres: run `docker compose up -d` first.
const { Client } = require('pg');

test('can talk to Postgres 16', async () => {
  const client = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'test', database: 'postgres' });
  await client.connect();
  const { rows } = await client.query('SHOW server_version');
  await client.end();
  expect(rows[0].server_version.startsWith('16')).toBe(true);
});
