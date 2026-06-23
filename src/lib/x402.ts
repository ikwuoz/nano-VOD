const ARC_TESTNET_CHAIN_ID = 'eip155:5042002';
const USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
const GATEWAY_WALLET = '0x0077777d7EBA4688BDeF3E311b846F25870A19B9';

export function buildPaymentRequiredHeader(params: {
    streamUrl: string;
    amountMicroUSDC: string;
    payTo: string;
}): string {
    const payload = {
        x402Version: 2,
        resource: {
            url: params.streamUrl,
            description: 'Video stream — $0.002/min paid per 15s chunk',
            mimeType: 'video/mp4',
        },
        accepts: [{
            scheme: 'exact',
            network: ARC_TESTNET_CHAIN_ID,
            asset: USDC_ADDRESS,
            amount: params.amountMicroUSDC,
            maxTimeoutSeconds: 604900,
            payTo: params.payTo,
            extra: {
                name: 'GatewayWalletBatched',
                version: '1',
                verifyingContract: GATEWAY_WALLET,
            },
        }],
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
}
