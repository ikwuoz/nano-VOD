import { kvIncr, kvIncrBy, kvGet } from './kv';
import { parseMicroUSDC, formatMicroUSDC } from './usdc-math';

const KEY_PAYMENTS = 'metrics:totalPayments';
const KEY_REVENUE = 'metrics:totalRevenueMicro';
const KEY_SESSIONS = 'metrics:sessionsStarted';

const PAYMENT_INTERVAL_MS = 15_000;

export async function recordPayment(amount: string) {
  await kvIncr(KEY_PAYMENTS);
  await kvIncrBy(KEY_REVENUE, Number(parseMicroUSDC(amount)));
}

export async function recordSessionStarted() {
  await kvIncr(KEY_SESSIONS);
}

export async function getMetrics() {
  const totalPayments = parseInt((await kvGet(KEY_PAYMENTS)) ?? '0', 10);
  const totalRevenueMicro = BigInt((await kvGet(KEY_REVENUE)) ?? '0');
  const totalSessions = parseInt((await kvGet(KEY_SESSIONS)) ?? '0', 10);

  return {
    totalPayments,
    totalRevenue: formatMicroUSDC(totalRevenueMicro),
    totalRuntimeMs: totalPayments * PAYMENT_INTERVAL_MS,
    totalRuntimeMin: ((totalPayments * PAYMENT_INTERVAL_MS) / 60000).toFixed(1),
    totalSessions,
  };
}
