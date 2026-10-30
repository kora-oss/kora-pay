#!/usr/bin/env node
'use strict';

const { parseArgs } = require('node:util');
const { calculatePrice, formatCurrency, TIERS } = require('../src/pricing');
const { version } = require('../package.json');

const DIVIDER = '-'.repeat(44);
const LABEL_WIDTH = 12;
const VOLUME_DISCOUNT_THRESHOLD = 10;
const VOLUME_DISCOUNT_RATE = 0.9;

const HELP = `kora-pay v${version}

Universal pricing quotes from your terminal.

Usage:
  kora-pay quote --plan <plan> --seats <n> [--currency <code>]

Commands:
  quote              Calculate a seat-based pricing quote

Options:
  -p, --plan         Plan to quote: ${Object.keys(TIERS).join(', ')}
  -s, --seats        Number of seats (non-negative integer)
  -c, --currency     ISO currency code for formatting (default: USD)
  -h, --help         Show this help message
  -v, --version      Show the version number

Examples:
  kora-pay quote --plan pro --seats 15 --currency NGN
  kora-pay quote -p team -s 12 -c KES`;

function fail(message) {
  process.stderr.write(`Error: ${message}\n\n${HELP}\n`);
  process.exitCode = 1;
}

function row(label, value) {
  return `${label.padEnd(LABEL_WIDTH)}${value}`;
}

function parseSeats(raw) {
  if (!/^\d+$/.test(raw.trim())) {
    throw new Error(`--seats must be a non-negative integer, received "${raw}"`);
  }
  return Number(raw);
}

function runQuote(values) {
  if (values.plan === undefined) {
    throw new Error('Missing required option --plan');
  }
  const plan = values.plan.toLowerCase();
  if (!(plan in TIERS)) {
    throw new Error(`Unknown plan "${values.plan}". Valid plans: ${Object.keys(TIERS).join(', ')}`);
  }
  if (values.seats === undefined) {
    throw new Error('Missing required option --seats');
  }
  const seats = parseSeats(values.seats);
  const currency = (values.currency || 'USD').toUpperCase();

  const hasDiscount = seats > VOLUME_DISCOUNT_THRESHOLD;
  const unitPrice = hasDiscount ? TIERS[plan] * VOLUME_DISCOUNT_RATE : TIERS[plan];
  const total = calculatePrice(plan, seats);

  process.stdout.write(
    [
      DIVIDER,
      '💳 Kora Pay Pricing Quote',
      DIVIDER,
      row('Plan:', plan),
      row('Seats:', `${seats}${hasDiscount ? ' (10% volume discount applied)' : ''}`),
      row('Unit Price:', formatCurrency(unitPrice, currency)),
      row('Total:', formatCurrency(total, currency)),
      DIVIDER,
      '',
    ].join('\n')
  );
}

function main() {
  let parsed;
  try {
    parsed = parseArgs({
      allowPositionals: true,
      options: {
        plan: { type: 'string', short: 'p' },
        seats: { type: 'string', short: 's' },
        currency: { type: 'string', short: 'c' },
        help: { type: 'boolean', short: 'h' },
        version: { type: 'boolean', short: 'v' },
      },
    });
  } catch (error) {
    return fail(error.message);
  }

  const { values, positionals } = parsed;

  if (values.help) {
    process.stdout.write(`${HELP}\n`);
    return;
  }
  if (values.version) {
    process.stdout.write(`${version}\n`);
    return;
  }

  const command = positionals[0];
  if (command === undefined) {
    return fail('Missing command');
  }
  if (command !== 'quote') {
    return fail(`Unknown command "${command}"`);
  }

  try {
    runQuote(values);
  } catch (error) {
    fail(error.message);
  }
}

main();
