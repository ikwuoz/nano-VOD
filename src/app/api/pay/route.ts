import { NextResponse } from 'next/server';
import { getCircleClient } from '@/lib/circle';
import { getPlatformFeeAddress } from '../wallet/provision/route';
import { parseMicroUSDC } from '@/lib/usdc-math';
import { checkCap, addSpend } from '@/lib/spending-cap';
import { recordPayment } from '@/lib/metrics';
import { buildPaymentRequiredHeader } from '@/lib/x402';
import { setSession } from '@/lib/session-store';

async function executeSplitPayment(params: {
  viewerWalletId: string;
  amount: string;
}): Promise<{ status: 'paid' } | { status: '402'; error: string; header: string }> {
  const { viewerWalletId, amount } = params;
  const platformWallet = await getPlatformFeeAddress();

  if (!process.env.CIRCLE_ENTITY_SECRET) {
    const paymentHeader = buildPaymentRequiredHeader({
      streamUrl: '/api/stream',
      amountMicroUSDC: parseMicroUSDC(amount).toString(),
      payTo: platformWallet,
    });
    return { status: '402', error: 'Payment processing unavailable: Circle nanopayments not configured', header: paymentHeader };
  }

  if (!platformWallet) {
    const paymentHeader = buildPaymentRequiredHeader({
      streamUrl: '/api/stream',
      amountMicroUSDC: parseMicroUSDC(amount).toString(),
      payTo: '',
    });
    return { status: '402', error: 'Payment processing unavailable: no platform wallet configured', header: paymentHeader };
  }

  await (getCircleClient().createTransaction as any)({ // eslint-disable-line @typescript-eslint/no-explicit-any
    walletId: viewerWalletId,
    destinationAddress: platformWallet,
    amount: [amount],
    tokenAddress: '0x3600000000000000000000000000000000000000',
    blockchain: 'ARC-TESTNET',
    fee: { type: 'level', config: { feeLevel: 'LOW' } },
  });

  return { status: 'paid' };
}

export async function POST(request: Request) {
  try {
    const { sessionId, viewerWalletId, amount } = await request.json();

    if (!sessionId || !viewerWalletId || !amount) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (!(await checkCap(viewerWalletId, amount))) {
      const microUSDC = parseMicroUSDC(amount).toString();
      const paymentHeader = buildPaymentRequiredHeader({
        streamUrl: '/api/stream',
        amountMicroUSDC: microUSDC,
        payTo: await getPlatformFeeAddress(),
      });
      return NextResponse.json(
        { error: 'Spending cap exceeded' },
        { status: 402, headers: { 'PAYMENT-REQUIRED': paymentHeader, 'X-X402-Required': 'true' } }
      );
    }

    const result = await executeSplitPayment({
      viewerWalletId,
      amount,
    });

    if (result.status === '402') {
      return NextResponse.json(
        { error: result.error },
        { status: 402, headers: { 'PAYMENT-REQUIRED': result.header, 'X-X402-Required': 'true' } }
      );
    }

    await addSpend(viewerWalletId, amount);
    await recordPayment(amount);
    await setSession(sessionId, Date.now());

    return NextResponse.json({ status: 'PAID', sessionExpiresAt: Date.now() + 20000 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Payment processing failed';
    const paymentHeader = buildPaymentRequiredHeader({
      streamUrl: '/api/stream',
      amountMicroUSDC: '500',
      payTo: await getPlatformFeeAddress(),
    });
    return NextResponse.json(
      { error: message },
      { status: 402, headers: { 'PAYMENT-REQUIRED': paymentHeader, 'X-X402-Required': 'true' } }
    );
  }
}
