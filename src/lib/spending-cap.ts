import { parseMicroUSDC, formatMicroUSDC } from './usdc-math';

interface CapEntry {
    cap: bigint;
    spent: bigint;
}

const capStore = new Map<string, CapEntry>();

export function setSpendingCap(walletId: string, capAmount: string) {
    capStore.set(walletId, { cap: parseMicroUSDC(capAmount), spent: BigInt(0) });
}

export function checkCap(walletId: string, amount: string): boolean {
    const entry = capStore.get(walletId);
    if (!entry) return true;
    const amountMicro = parseMicroUSDC(amount);
    return entry.spent + amountMicro <= entry.cap;
}

export function addSpend(walletId: string, amount: string) {
    const entry = capStore.get(walletId);
    if (entry) {
        entry.spent += parseMicroUSDC(amount);
    }
}

export function getCapStatus(walletId: string): { cap: string; spent: string; remaining: string } | null {
    const entry = capStore.get(walletId);
    if (!entry) return null;
    return {
        cap: formatMicroUSDC(entry.cap),
        spent: formatMicroUSDC(entry.spent),
        remaining: formatMicroUSDC(entry.cap - entry.spent),
    };
}
