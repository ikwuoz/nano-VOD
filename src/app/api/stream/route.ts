import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session-store';
import { buildPaymentRequiredHeader } from '@/lib/x402';
import { getPlatformFeeAddress } from '../wallet/provision/route';
import { recordError, recordLatency, recordStreamSource } from '@/lib/metrics';

const DEMO_VIDEO_URLS: Record<string, string> = {
  'big-buck-bunny': 'https://remotion.media/BigBuckBunny.mp4',
  'sintel': 'https://remotion.media/video.mp4',
};

const JELLYFIN_ITEM_IDS: Record<string, string> = {
  'big-buck-bunny': '410921f26d3baa6cfab8d34ce2cd14ad',
  'sintel': '416e6c6c7f4ac81c1db06746f4067e19',
};

async function proxyVideo(videoUrl: string, rangeHeader: string | null) {
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
}

export async function GET(request: Request) {
  const start = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const jellyfinItemId = searchParams.get('itemId');

    if (!sessionId || !jellyfinItemId) {
      return NextResponse.json({ error: 'Session parameters required' }, { status: 400 });
    }

    const lastPaidTimestamp = await getSession(sessionId);
    const paymentWindowGracePeriod = 20 * 1000;

    if (!lastPaidTimestamp || (Date.now() - lastPaidTimestamp) > paymentWindowGracePeriod) {
      recordError('402_lease_expired').catch(() => {});
      const payTo = await getPlatformFeeAddress();
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
            recordStreamSource('jellyfin').catch(() => {});
            recordLatency('stream', Date.now() - start).catch(() => {});
            return new NextResponse(jellyfinResponse.body, {
              status: jellyfinResponse.status,
              headers: {
                'Content-Type': jellyfinResponse.headers.get('Content-Type') || 'video/mp4',
                'Content-Range': jellyfinResponse.headers.get('Content-Range') || '',
                'Accept-Ranges': 'bytes',
                'X-Jellyfin-Status': 'serving',
              },
            });
          }
        } catch {
          clearTimeout(timeout);
          console.warn('[stream] Jellyfin fetch failed for item', mappedId, 'at', jellyfinUrl);
        }
      }
      try {
        const result = await proxyVideo(demoUrl, rangeHeader);
        recordStreamSource('demo').catch(() => {});
        recordLatency('stream', Date.now() - start).catch(() => {});
        return result;
      } catch {
        recordError('stream_fail').catch(() => {});
        recordLatency('stream', Date.now() - start).catch(() => {});
        return new NextResponse(null, { status: 503, headers: { 'X-Stream-Error': 'proxy-unavailable' } });
      }
    }

    recordError('stream_fail').catch(() => {});
    recordLatency('stream', Date.now() - start).catch(() => {});
    return NextResponse.json({ error: 'Video source unavailable' }, { status: 502 });
  } catch {
    recordError('server_error').catch(() => {});
    recordLatency('stream', Date.now() - start).catch(() => {});
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
