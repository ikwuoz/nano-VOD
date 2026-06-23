import { NextResponse } from 'next/server';
import { circleClient } from '@/lib/circle';
import { notifyPayment } from '@/lib/payment-events';
import { parseMicroUSDC } from '@/lib/usdc-math';
import { checkCap, addSpend } from '@/lib/spending-cap';
import { recordPayment } from '@/lib/metrics';
import { getPlatformFeeAddress } from '../wallet/provision/route';
import { buildPaymentRequiredHeader } from '@/lib/x402';
import { loadSessions, saveSessions } from '@/lib/session-store';

// Tracks when a user last successfully paid.
export const paymentSessions = loadSessions();

async function executeSplitPayment(params: {
    viewerWalletId: string;
    amount: string;
}) {
    const { viewerWalletId, amount } = params;

    if (!process.env.CIRCLE_ENTITY_SECRET) {
        console.log('[PAY] CIRCLE_ENTITY_SECRET not set — skipping Circle transaction');
        return;
    }

    const platformWallet = getPlatformFeeAddress();
    if (!platformWallet) {
        console.log('[PAY] No platform wallet configured — skipping Circle transaction');
        return;
    }

    console.log('[PAY] Creating Circle transaction:', {
        walletId: viewerWalletId,
        destinationAddress: platformWallet,
        amount: [amount],
        tokenAddress: '0x3600000000000000000000000000000000000000',
        blockchain: 'ARC-TESTNET',
    });

    const txResponse = await (circleClient.createTransaction as any)({
        walletId: viewerWalletId,
        destinationAddress: platformWallet,
        amount: [amount],
        tokenAddress: '0x3600000000000000000000000000000000000000',
        blockchain: 'ARC-TESTNET',
        fee: { type: 'level', config: { feeLevel: 'LOW' } },
    });

    console.log('[PAY] Circle transaction created:', JSON.stringify(txResponse?.data));
}

export async function POST(request: Request) {
    try {
        const { sessionId, viewerWalletId, amount } = await request.json();

        if (!sessionId || !viewerWalletId || !amount) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        if (!checkCap(viewerWalletId, amount)) {
            console.log('[PAY] Spending cap exceeded for wallet', viewerWalletId, 'amount', amount);
            const microUSDC = parseMicroUSDC(amount).toString();
            const paymentHeader = buildPaymentRequiredHeader({
                streamUrl: '/api/stream',
                amountMicroUSDC: microUSDC,
                payTo: getPlatformFeeAddress() ?? '',
            });
            return NextResponse.json(
                { error: 'Spending cap exceeded' },
                { status: 402, headers: { 'PAYMENT-REQUIRED': paymentHeader, 'X-X402-Required': 'true' } }
            );
        }

        await executeSplitPayment({
            viewerWalletId,
            amount,
        });

        addSpend(viewerWalletId, amount);
        recordPayment(amount);

        paymentSessions.set(sessionId, Date.now());
        saveSessions(paymentSessions);
        notifyPayment(sessionId, { type: 'payment_confirmed', sessionExpiresAt: Date.now() + 20000 });
        console.log('[PAY] Payment success for session', sessionId, 'wallet', viewerWalletId, 'amount', amount);
        return NextResponse.json({ status: 'PAID', sessionExpiresAt: Date.now() + 20000 });
    } catch (error: unknown) {
        console.error('Pay route error:', error);
        const message = error instanceof Error ? error.message : 'Payment processing failed';
        const paymentHeader = buildPaymentRequiredHeader({
            streamUrl: '/api/stream',
            amountMicroUSDC: '500',
            payTo: getPlatformFeeAddress() ?? '',
        });
        return NextResponse.json(
            { error: message },
            { status: 402, headers: { 'PAYMENT-REQUIRED': paymentHeader, 'X-X402-Required': 'true' } }
        );
    }
}
