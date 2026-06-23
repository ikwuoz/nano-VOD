import { kvSet } from './kv';

const TOKEN_TTL_SECONDS = 30;

export interface TokenSession {
  viewerWalletId: string;
  createdAt: number;
}

function tokenKey(sessionId: string): string {
  return `token:${sessionId}`;
}

export async function createToken(sessionId: string, data: TokenSession): Promise<void> {
  await kvSet(tokenKey(sessionId), JSON.stringify(data), { ex: TOKEN_TTL_SECONDS });
}
