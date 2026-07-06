import { NextResponse } from 'next/server';

export async function GET() {
  const checks: Record<string, string> = {
    circle: process.env.CIRCLE_ENTITY_SECRET ? 'configured' : 'missing',
    jellyfin: process.env.JELLYFIN_SERVER_URL ? 'configured' : 'missing',
    kv: process.env.KV_REST_API_URL ? 'configured' : 'missing',
    platformWallet: process.env.PLATFORM_FEE_WALLET ? 'configured' : 'missing',
  };

  const allOk = Object.values(checks).every((v) => v === 'configured');

  return NextResponse.json(
    { status: allOk ? 'ok' : 'degraded', checks },
    { status: allOk ? 200 : 503 }
  );
}
