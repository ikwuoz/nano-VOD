import { addClient, removeClient } from '@/lib/payment-events';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
        return new Response('sessionId required', { status: 400 });
    }

    const stream = new ReadableStream({
        start(controller) {
            addClient(sessionId, controller);
            controller.enqueue(`data: {"type":"connected","sessionId":"${sessionId}"}\n\n`);

            request.signal.addEventListener('abort', () => {
                removeClient(sessionId);
            });
        },
    });

    return new Response(stream, {
        status: 200,
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
