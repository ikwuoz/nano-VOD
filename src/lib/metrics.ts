import { parseMicroUSDC, formatMicroUSDC } from './usdc-math';

const PAYMENT_INTERVAL_MS = 15_000;

let totalPayments = 0;
let totalRevenueMicro = BigInt(0);
let sessionsStarted = 0;

export function recordPayment(amount: string) {
    totalPayments++;
    totalRevenueMicro += parseMicroUSDC(amount);
}

export function recordSessionStarted() {
    sessionsStarted++;
}

export function getMetrics() {
    return {
        totalPayments,
        totalRevenue: formatMicroUSDC(totalRevenueMicro),
        totalRuntimeMs: totalPayments * PAYMENT_INTERVAL_MS,
        totalRuntimeMin: ((totalPayments * PAYMENT_INTERVAL_MS) / 60000).toFixed(1),
        totalSessions: sessionsStarted,
    };
}
