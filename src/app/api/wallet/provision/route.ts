import { NextResponse } from 'next/server';
import { provisionArcAgentWallet, getWalletUsdcBalance } from '@/lib/circle';
import { setSpendingCap } from '@/lib/spending-cap';
import { loadWalletStore, saveWalletStore } from '@/lib/wallet-store';

const SPENDING_CAP = '1.00';

export async function getPlatformFeeAddress(): Promise<string> {
  if (process.env.PLATFORM_FEE_WALLET) return process.env.PLATFORM_FEE_WALLET;
  const store = await loadWalletStore();
  return store.platformFeeAddress ?? '';
}

export async function POST(request: Request) {
  try {
    const { viewerId, walletId } = await request.json();
    if (!viewerId) {
      return NextResponse.json({ error: 'viewerId required' }, { status: 400 });
    }

    const store = await loadWalletStore();

    const existing = store.viewers[viewerId];
    if (existing) {
      await setSpendingCap(existing.id, SPENDING_CAP);
      return NextResponse.json({
        id: existing.id,
        address: existing.address,
        platformFeeAddress: store.platformFeeAddress ?? '',
        balance: await getWalletUsdcBalance(existing.id),
        spendingCap: SPENDING_CAP,
      });
    }

    if (walletId) {
      return NextResponse.json({
        id: walletId,
        balance: await getWalletUsdcBalance(walletId),
      });
    }

    if (store.walletSetId && process.env.CIRCLE_ENTITY_SECRET) {
      if (!store.platformFeeAddress) {
        const wallets = await provisionArcAgentWallet(store.walletSetId, 2, [viewerId, 'platform-fee']);
        store.platformFeeAddress = wallets[1]?.address;
        store.viewers[viewerId] = { id: wallets[0]!.id!, address: wallets[0]!.address! };
      } else {
        const wallets = await provisionArcAgentWallet(store.walletSetId, 1, [viewerId]);
        store.viewers[viewerId] = { id: wallets[0]!.id!, address: wallets[0]!.address! };
      }
      await saveWalletStore(store);

      const wallet = store.viewers[viewerId];
      await setSpendingCap(wallet.id, SPENDING_CAP);
      return NextResponse.json({
        id: wallet.id,
        address: wallet.address,
        platformFeeAddress: store.platformFeeAddress ?? '',
        balance: await getWalletUsdcBalance(wallet.id),
        spendingCap: SPENDING_CAP,
      });
    }

    return NextResponse.json(
      { error: 'Failed to provision wallet: CIRCLE_ENTITY_SECRET is not configured. Set it in .env to enable Circle nanopayments.' },
      { status: 500 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Wallet provisioning failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
