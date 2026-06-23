import { kvGet, kvSet } from './kv';

export interface ViewerWallet {
  id: string;
  address: string;
}

export interface WalletStore {
  walletSetId?: string;
  platformFeeAddress?: string;
  viewers: Record<string, ViewerWallet>;
}

const WALLET_KEY = 'wallet:store';

export async function loadWalletStore(): Promise<WalletStore> {
  const raw = await kvGet(WALLET_KEY);
  const store: WalletStore = raw ? JSON.parse(raw) : { viewers: {} };

  if (!store.walletSetId && process.env.CIRCLE_WALLET_SET_ID) {
    store.walletSetId = process.env.CIRCLE_WALLET_SET_ID;
    await saveWalletStore(store);
  }

  return store;
}

export async function saveWalletStore(data: WalletStore): Promise<void> {
  await kvSet(WALLET_KEY, JSON.stringify(data));
}
