import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const STORE_PATH = join(process.cwd(), '.wallets.json');

export interface ViewerWallet {
    id: string;
    address: string;
}

export interface WalletStore {
    walletSetId?: string;
    platformFeeAddress?: string;
    viewers: Record<string, ViewerWallet>;
}

export function loadWalletStore(): WalletStore {
    let store: WalletStore = { viewers: {} };
    try {
        if (existsSync(STORE_PATH)) {
            store = JSON.parse(readFileSync(STORE_PATH, 'utf-8'));
        }
    } catch {
        // ignore corrupt file
    }

    if (!store.walletSetId && process.env.CIRCLE_WALLET_SET_ID) {
        store.walletSetId = process.env.CIRCLE_WALLET_SET_ID;
        saveWalletStore(store);
    }

    return store;
}

export function saveWalletStore(data: WalletStore): void {
    writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}
