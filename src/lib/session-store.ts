import { kvGet, kvSet, kvDel } from './kv';

const SESSION_TTL_SECONDS = 60;

export async function getSession(sessionId: string): Promise<number | null> {
  const val = await kvGet(`payment_session:${sessionId}`);
  return val ? parseInt(val, 10) : null;
}

export async function setSession(sessionId: string, timestamp: number): Promise<void> {
  await kvSet(`payment_session:${sessionId}`, String(timestamp), { ex: SESSION_TTL_SECONDS });
}

export async function delSession(sessionId: string): Promise<void> {
  await kvDel(`payment_session:${sessionId}`);
}
