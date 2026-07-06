import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { recordSessionStarted, recordError, recordLatency } from '@/lib/metrics';
import { createToken } from '@/lib/token-store';

const TOKEN_TTL_MS = 30_000;

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const { viewerWalletId } = await request.json();

    if (!viewerWalletId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const sessionId = crypto.randomUUID();
    await createToken(sessionId, {
      viewerWalletId,
      createdAt: Date.now(),
    });
    await recordSessionStarted();

    recordLatency('token', Date.now() - start).catch(() => {});
    return NextResponse.json({
      sessionId,
      token: sessionId,
      expiresAt: Date.now() + TOKEN_TTL_MS,
    });
  } catch (error: unknown) {
    recordError('token_fail').catch(() => {});
    recordLatency('token', Date.now() - start).catch(() => {});
    const message = error instanceof Error ? error.message : 'Token creation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
