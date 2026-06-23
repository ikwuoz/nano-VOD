import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { recordSessionStarted } from '@/lib/metrics';

interface TokenSession {
    viewerWalletId: string;
    creatorWalletAddress: string;
    createdAt: number;
}

const tokenStore = new Map<string, TokenSession>();

export function getTokenSession(sessionId: string): TokenSession | undefined {
    return tokenStore.get(sessionId);
}

export async function POST(request: Request) {
    try {
        const { viewerWalletId, creatorWalletAddress } = await request.json();

        if (!viewerWalletId || !creatorWalletAddress) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const sessionId = crypto.randomUUID();
        tokenStore.set(sessionId, {
            viewerWalletId,
            creatorWalletAddress,
            createdAt: Date.now(),
        });
        recordSessionStarted();

        return NextResponse.json({
            sessionId,
            token: sessionId,
            expiresAt: Date.now() + 20000,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Token creation failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
