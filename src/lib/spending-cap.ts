import { kvGet, kvSet } from './kv';
import { parseMicroUSDC, formatMicroUSDC } from './usdc-math';

interface CapEntry {
  cap: string;
  spent: string;
}

function capKey(walletId: string): string {
  return `cap:${walletId}`;
}

export async function setSpendingCap(walletId: string, capAmount: string) {
  await kvSet(capKey(walletId), JSON.stringify({ cap: parseMicroUSDC(capAmount).toString(), spent: '0' }));
}

export async function checkCap(walletId: string, amount: string): Promise<boolean> {
  const raw = await kvGet(capKey(walletId));
  if (!raw) return true;
  const entry: CapEntry = JSON.parse(raw);
  const cap = BigInt(entry.cap);
  const spent = BigInt(entry.spent);
  const amountMicro = parseMicroUSDC(amount);
  return spent + amountMicro <= cap;
}

export async function addSpend(walletId: string, amount: string) {
  const raw = await kvGet(capKey(walletId));
  if (!raw) return;
  const entry: CapEntry = JSON.parse(raw);
  const spent = BigInt(entry.spent) + parseMicroUSDC(amount);
  entry.spent = spent.toString();
  await kvSet(capKey(walletId), JSON.stringify(entry));
}

export async function getCapStatus(walletId: string): Promise<{ cap: string; spent: string; remaining: string } | null> {
  const raw = await kvGet(capKey(walletId));
  if (!raw) return null;
  const entry: CapEntry = JSON.parse(raw);
  const cap = BigInt(entry.cap);
  const spent = BigInt(entry.spent);
  return {
    cap: formatMicroUSDC(cap),
    spent: formatMicroUSDC(spent),
    remaining: formatMicroUSDC(cap - spent),
  };
}
