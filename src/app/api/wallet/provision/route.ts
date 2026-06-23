import { NextResponse } from 'next/server';
import { provisionArcAgentWallet, createDeveloperWalletSet, getWalletUsdcBalance } from '@/lib/circle';
import { setSpendingCap } from '@/lib/spending-cap';
import { loadWalletStore, saveWalletStore } from '@/lib/wallet-store';

const SPENDING_CAP = '1.00';

export function getPlatformFeeAddress(): string | undefined {
    return loadWalletStore().platformFeeAddress || process.env.PLATFORM_FEE_WALLET || undefined;
}

export async function POST(request: Request) {
    try {
        const { viewerId } = await request.json();
        if (!viewerId) {
            return NextResponse.json({ error: 'viewerId required' }, { status: 400 });
        }

        const store = loadWalletStore();

        // Return existing wallet for this viewer
        const existing = store.viewers[viewerId];
        if (existing) {
            setSpendingCap(existing.id, SPENDING_CAP);
            return NextResponse.json({
                id: existing.id,
                address: existing.address,
                platformFeeAddress: store.platformFeeAddress ?? '',
                balance: await getWalletUsdcBalance(existing.id),
                spendingCap: SPENDING_CAP,
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
            saveWalletStore(store);

            const wallet = store.viewers[viewerId];
            setSpendingCap(wallet.id, SPENDING_CAP);
            return NextResponse.json({
                id: wallet.id,
                address: wallet.address,
                platformFeeAddress: store.platformFeeAddress ?? '',
                balance: await getWalletUsdcBalance(wallet.id),
                spendingCap: SPENDING_CAP,
            });
        }

        // Fallback mock (no entity secret)
        const mockId = 'viewer_agent_wallet_abc';
        setSpendingCap(mockId, SPENDING_CAP);
        return NextResponse.json({
            id: mockId,
            address: '0xArc84...92F4',
            platformFeeAddress: store.platformFeeAddress ?? '',
            balance: '1.500000',
            spendingCap: SPENDING_CAP,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Wallet provisioning failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
