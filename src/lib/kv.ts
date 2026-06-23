import { Redis } from '@upstash/redis';

let kvClient: Redis | null = null;
let kvChecked = false;

function getKv() {
  if (kvChecked) return kvClient;
  kvChecked = true;
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      kvClient = new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      });
    } catch {
      kvClient = null;
    }
  }
  return kvClient;
}

const memStore = new Map<string, string>();

export async function kvGet(key: string): Promise<string | null> {
  const kv = getKv();
  if (kv) {
    const val = await kv.get(key);
    if (val === null || val === undefined) return null;
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    return JSON.stringify(val);
  }
  return memStore.get(key) ?? null;
}

export async function kvSet(key: string, value: string, opts?: { ex?: number }): Promise<void> {
  const kv = getKv();
  if (kv) {
    if (opts?.ex) await kv.set(key, value, { ex: opts.ex });
    else await kv.set(key, value);
  } else {
    memStore.set(key, value);
  }
}

export async function kvDel(key: string): Promise<void> {
  const kv = getKv();
  if (kv) await kv.del(key);
  else memStore.delete(key);
}

export async function kvIncr(key: string): Promise<number> {
  const kv = getKv();
  if (kv) return kv.incr(key);
  const val = parseInt(memStore.get(key) ?? '0', 10) + 1;
  memStore.set(key, String(val));
  return val;
}

export async function kvIncrBy(key: string, amount: number): Promise<number> {
  const kv = getKv();
  if (kv) return kv.incrby(key, amount);
  const val = parseInt(memStore.get(key) ?? '0', 10) + amount;
  memStore.set(key, String(val));
  return val;
}
