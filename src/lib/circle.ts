import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

if (!process.env.CIRCLE_DEVELOPER_KEY) {
    throw new Error('Critical Configuration Error: CIRCLE_DEVELOPER_KEY is missing from environment.');
}

/**
 * Global instance client config for handling automated agent mechanics
 * Built for high-throughput micro-transactions on the Arc infrastructure
 */
export const circleClient = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_DEVELOPER_KEY!,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET ?? '',
});

/**
 * Generates an automated, program-controlled Web3 wallet set 
 * for onboarding new content creators on the platform.
 */
export async function createDeveloperWalletSet(name: string) {
    try {
        const response = await circleClient.createWalletSet({
            name: `${name}_Wallet_Set`
        });
        return response.data?.walletSet;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to create secure Circle Wallet Set:', error);
        throw new Error(`Circle Wallet Set Creation Error: ${message}`);
    }
}

/**
 * Provisions an on-chain, programmable smart account linked to an active wallet set
 * Designed specifically for low-gas/no-gas USDC transactions
 */
export async function getWalletUsdcBalance(walletId: string): Promise<string> {
    const { data } = await circleClient.getWalletTokenBalance({ id: walletId });
    const usdc = data?.tokenBalances?.find(
        (tb) => tb.token.symbol === 'USDC'
    );
    return usdc?.amount ?? '0.000000';
}

export async function provisionArcAgentWallet(walletSetId: string, count: number = 1, refIds?: string[]) {
    try {
        const metadata = refIds?.map(refId => ({ refId }));
        const response = await circleClient.createWallets({
            blockchains: ['ARC-TESTNET'],
            accountType: 'SCA',
            walletSetId,
            count,
            ...(metadata ? { metadata } : {}),
        });
        return response.data?.wallets ?? [];
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to provision secure Arc smart agent account:', error);
        throw new Error(`Arc Wallet Provision Error: ${message}`);
    }
}
