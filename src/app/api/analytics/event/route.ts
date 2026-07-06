import { NextResponse } from 'next/server';
import { recordClientEvent } from '@/lib/metrics';
import type { ClientEvent } from '@/lib/metrics';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = body?.event as ClientEvent | undefined;

    if (!event) {
      return NextResponse.json({ error: 'event required' }, { status: 400 });
    }

    const valid: ClientEvent[] = [
      'play_started', 'play_paused', 'video_ended',
      'client_402', 'client_stream_error', 'client_token_error',
    ];
    if (!valid.includes(event)) {
      return NextResponse.json({ error: 'invalid event' }, { status: 400 });
    }

    await recordClientEvent(event);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
