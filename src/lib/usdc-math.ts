export function parseMicroUSDC(amount: string): bigint {
    const [whole = '0', fraction = ''] = amount.split('.');
    const padded = fraction.padEnd(6, '0').slice(0, 6);
    return BigInt(whole + padded);
}

export function formatMicroUSDC(val: bigint): string {
    const s = val.toString().padStart(7, '0');
    const intPart = s.slice(0, -6) || '0';
    const fracPart = s.slice(-6);
    return `${intPart}.${fracPart}`;
}
