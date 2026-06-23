import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SESSION_PATH = join(process.cwd(), '.sessions.json');

export function loadSessions(): Map<string, number> {
  const map = new Map<string, number>();
  try {
    if (existsSync(SESSION_PATH)) {
      const data = JSON.parse(readFileSync(SESSION_PATH, 'utf-8'));
      for (const [key, value] of Object.entries(data)) {
        map.set(key, value as number);
      }
    }
  } catch (err) {
    console.error('[session-store] Failed to load sessions:', err);
  }
  return map;
}

export function saveSessions(map: Map<string, number>): void {
  try {
    const obj: Record<string, number> = Object.fromEntries(map);
    writeFileSync(SESSION_PATH, JSON.stringify(obj, null, 2));
  } catch (err) {
    console.error('[session-store] Failed to save sessions:', err);
  }
}
