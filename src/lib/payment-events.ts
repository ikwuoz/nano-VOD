type StreamController = ReadableStreamDefaultController;

const clients = new Map<string, StreamController>();

export function addClient(sessionId: string, controller: StreamController) {
    clients.set(sessionId, controller);
}

export function removeClient(sessionId: string) {
    clients.delete(sessionId);
}

export function notifyPayment(sessionId: string, data: object) {
    const controller = clients.get(sessionId);
    if (controller) {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
    }
}
