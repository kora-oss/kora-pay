import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import pkg from '../package.json';

const CLI = path.resolve(process.cwd(), 'bin/kora-pay.js');

function run(...args) {
  const result = spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
}

describe('kora-pay CLI', () => {
  it('quotes a discounted plan in the requested currency', () => {
    const { code, stdout } = run('quote', '--plan=pro', '--seats=15', '--currency=NGN');

    expect(code).toBe(0);
    expect(stdout).toContain('Kora Pay Pricing Quote');
    expect(stdout).toContain('Plan:       pro');
    expect(stdout).toContain('Seats:      15 (10% volume discount applied)');
    expect(stdout).toContain('Unit Price: ₦9.00');
    expect(stdout).toContain('Total:      ₦135.00');
  });

  it('does not discount at or below 10 seats and defaults to USD', () => {
    const { code, stdout } = run('quote', '--plan=pro', '--seats=10');

    expect(code).toBe(0);
    expect(stdout).toContain('Seats:      10');
    expect(stdout).not.toContain('volume discount');
    expect(stdout).toContain('Unit Price: $10.00');
    expect(stdout).toContain('Total:      $100.00');
  });

  it('accepts short option aliases', () => {
    const { code, stdout } = run('quote', '-p', 'team', '-s', '12', '-c', 'KES');

    expect(code).toBe(0);
    expect(stdout).toContain('Plan:       team');
    expect(stdout).toContain('Unit Price: KSh7.20');
    expect(stdout).toContain('Total:      KSh86.40');
  });

  it('quotes zero seats on the free plan', () => {
    const { code, stdout } = run('quote', '--plan=free', '--seats=0');

    expect(code).toBe(0);
    expect(stdout).toContain('Total:      $0.00');
  });

  it('rejects an unknown plan', () => {
    const { code, stderr } = run('quote', '--plan=gold', '--seats=5');

    expect(code).toBe(1);
    expect(stderr).toContain('Unknown plan "gold"');
    expect(stderr).toContain('free, pro, team');
  });

  it('rejects non-integer seats', () => {
    const { code, stderr } = run('quote', '--plan=pro', '--seats=1.5');

    expect(code).toBe(1);
    expect(stderr).toContain('--seats must be a non-negative integer');
  });

  it('rejects negative seats', () => {
    const { code, stderr } = run('quote', '--plan=pro', '--seats=-3');

    expect(code).toBe(1);
    expect(stderr).toContain('--seats must be a non-negative integer');
  });

  it('requires --plan and --seats', () => {
    const missingPlan = run('quote', '--seats=5');
    expect(missingPlan.code).toBe(1);
    expect(missingPlan.stderr).toContain('Missing required option --plan');

    const missingSeats = run('quote', '--plan=pro');
    expect(missingSeats.code).toBe(1);
    expect(missingSeats.stderr).toContain('Missing required option --seats');
  });

  it('rejects an unknown command', () => {
    const { code, stderr } = run('refund');

    expect(code).toBe(1);
    expect(stderr).toContain('Unknown command "refund"');
  });

  it('prints usage for --help', () => {
    const { code, stdout } = run('--help');

    expect(code).toBe(0);
    expect(stdout).toContain('Usage:');
    expect(stdout).toContain('kora-pay quote --plan <plan> --seats <n>');
  });

  it('prints the package version for --version', () => {
    const { code, stdout } = run('--version');

    expect(code).toBe(0);
    expect(stdout.trim()).toBe(pkg.version);
  });
});
