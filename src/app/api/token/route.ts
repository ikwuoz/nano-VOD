import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { recordSessionStarted } from '@/lib/metrics';
import { createToken } from '@/lib/token-store';

const TOKEN_TTL_MS = 30_000;

export async function POST(request: Request) {
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

    return NextResponse.json({
      sessionId,
      token: sessionId,
      expiresAt: Date.now() + TOKEN_TTL_MS,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Token creation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
