import { NextResponse } from 'next/server';
import { paymentSessions } from '../pay/route';
import { buildPaymentRequiredHeader } from '@/lib/x402';
import { getPlatformFeeAddress } from '../wallet/provision/route';

const DEMO_VIDEO_URLS: Record<string, string> = {
    'big-buck-bunny': 'https://remotion.media/BigBuckBunny.mp4',
    'sintel': 'https://remotion.media/video.mp4',
};

const JELLYFIN_ITEM_IDS: Record<string, string> = {
    'big-buck-bunny': '410921f26d3baa6cfab8d34ce2cd14ad',
    'sintel': '416e6c6c7f4ac81c1db06746f4067e19',
};

async function proxyVideo(videoUrl: string, rangeHeader: string | null) {
    try {
        const response = await fetch(videoUrl, {
            headers: { 'Range': rangeHeader || 'bytes=0-' },
        });
        return new NextResponse(response.body, {
            status: response.status,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'video/mp4',
                'Content-Range': response.headers.get('Content-Range') || '',
                'Accept-Ranges': 'bytes',
            },
        });
    } catch (err) {
        console.error('proxyVideo fetch error:', videoUrl, err);
        return NextResponse.json({ error: 'CDN proxy unavailable' }, { status: 502 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');
        const jellyfinItemId = searchParams.get('itemId');

        if (!sessionId || !jellyfinItemId) {
            return NextResponse.json({ error: 'Session parameters required' }, { status: 400 });
        }

        const lastPaidTimestamp = paymentSessions.get(sessionId);
        const paymentWindowGracePeriod = 20 * 1000;

        if (!lastPaidTimestamp || (Date.now() - lastPaidTimestamp) > paymentWindowGracePeriod) {
            const payTo = getPlatformFeeAddress() ?? '';
            const paymentHeader = buildPaymentRequiredHeader({
                streamUrl: request.url,
                amountMicroUSDC: '500',
                payTo,
            });
            return NextResponse.json(
                { error: 'Payment Required: Nanopayment stream interrupted' },
                { status: 402, headers: { 'PAYMENT-REQUIRED': paymentHeader, 'X-X402-Required': 'true' } }
            );
        }

        const rangeHeader = request.headers.get('Range');

        // Demo mode: proxy from public CDN when Jellyfin is unavailable
        const demoUrl = DEMO_VIDEO_URLS[jellyfinItemId];
        if (demoUrl) {
            const jellyfinUrl = process.env.JELLYFIN_SERVER_URL;
            const jellyfinKey = process.env.JELLYFIN_API_KEY;
            const mappedId = JELLYFIN_ITEM_IDS[jellyfinItemId];
            if (mappedId && jellyfinUrl && jellyfinKey) {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 10000);
                try {
                    const jellyfinResponse = await fetch(
                        `${jellyfinUrl}/Videos/${mappedId}/stream?api_key=${jellyfinKey}`,
                        { headers: { 'Range': rangeHeader || 'bytes=0-' }, signal: controller.signal }
                    );
                    clearTimeout(timeout);
                    if (jellyfinResponse.ok) {
                        return new NextResponse(jellyfinResponse.body, {
                            status: jellyfinResponse.status,
                            headers: {
                                'Content-Type': jellyfinResponse.headers.get('Content-Type') || 'video/mp4',
                                'Content-Range': jellyfinResponse.headers.get('Content-Range') || '',
                                'Accept-Ranges': 'bytes',
                            },
                        });
                    }
                } catch {
                    clearTimeout(timeout);
                    // Jellyfin unreachable — fall through to demo CDN
                }
            }
            return proxyVideo(demoUrl, rangeHeader);
        }

        return NextResponse.json({ error: 'Video source unavailable' }, { status: 502 });
    } catch (err) {
        console.error('Stream route unhandled error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
