'use client';
import { useEffect, useRef, useState, use } from 'react';

function getWalletId(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('viewerWalletId');
}

function getCreatorAddress(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('creatorWalletAddress');
}

export default function WatchPortal({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const videoRef = useRef<HTMLVideoElement>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [paymentError, setPaymentError] = useState(false);

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [leaseReady, setLeaseReady] = useState(false);
    const [tokenError, setTokenError] = useState(false);
    const [viewerWalletId] = useState<string | null>(getWalletId);
    const [creatorWalletAddress] = useState<string | null>(getCreatorAddress);

    const handleStreamBlock = () => {
        setPaymentError(true);
        if (videoRef.current) {
            videoRef.current.pause();
        }
    };

    useEffect(() => {
        let cancelled = false;

        (async () => {
            let wId = viewerWalletId;
            let cAddr = creatorWalletAddress;

            if (!wId || !cAddr) {
                let viewerId = localStorage.getItem('viewerId');
                if (!viewerId) {
                    viewerId = crypto.randomUUID();
                    localStorage.setItem('viewerId', viewerId);
                }
                try {
                    const res = await fetch('/api/wallet/provision', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ viewerId }),
                    });
                    const data = await res.json();
                    if (data.id) {
                        wId = data.id;
                        cAddr = data.platformFeeAddress;
                        sessionStorage.setItem('viewerWalletId', data.id);
                        sessionStorage.setItem('creatorWalletAddress', data.platformFeeAddress);
                    }
                } catch {
                    if (!cancelled) setTokenError(true);
                    return;
                }
            }

            if (!wId || !cAddr) {
                if (!cancelled) setTokenError(true);
                return;
            }

            const tokenRes = await fetch('/api/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ viewerWalletId: wId, creatorWalletAddress: cAddr }),
            });
            if (!tokenRes.ok) {
                if (!cancelled) setTokenError(true);
                return;
            }
            const tokenData = await tokenRes.json();
            if (cancelled) return;
            setSessionId(tokenData.sessionId);

            const payRes = await fetch('/api/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: tokenData.sessionId,
                    viewerWalletId: wId,
                    creatorWalletAddress: cAddr,
                    amount: '0.000500',
                }),
            });
            if (cancelled) return;
            if (payRes.ok) setLeaseReady(true);
            else if (payRes.status === 402) handleStreamBlock();

            const es = new EventSource(`/api/events?sessionId=${tokenData.sessionId}`);
            eventSourceRef.current = es;

            es.addEventListener('message', (e) => {
                try {
                    const event = JSON.parse(e.data);
                    if (event.type === 'payment_expired') {
                        handleStreamBlock();
                    }
                } catch {
                    // ignore
                }
            });
        })();

        return () => {
            cancelled = true;
            eventSourceRef.current?.close();
        };
    }, [viewerWalletId, creatorWalletAddress]);

    useEffect(() => {
        let paymentInterval: NodeJS.Timeout;

        const wId = sessionStorage.getItem('viewerWalletId');
        const cAddr = sessionStorage.getItem('creatorWalletAddress');

        if (isPlaying && !paymentError && sessionId && wId && cAddr) {
            const triggerMicroPayment = async () => {
                try {
                    const res = await fetch('/api/pay', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sessionId,
                            viewerWalletId: wId,
                            creatorWalletAddress: cAddr,
                            amount: '0.000500',
                        }),
                    });

                    if (res.status === 402) {
                        handleStreamBlock();
                    }
                } catch {
                    handleStreamBlock();
                }
            };

            triggerMicroPayment();
            paymentInterval = setInterval(triggerMicroPayment, 15000);
        }

        return () => clearInterval(paymentInterval);
    }, [isPlaying, paymentError, sessionId]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
            <h1 className="text-2xl font-bold mb-4">nano VOD Portal</h1>

            <div className="relative w-full max-w-4xl aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
                {paymentError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 p-4 text-center">
                        <p className="text-red-500 font-semibold text-lg">⚠️ HTTP 402: Payment Required</p>
                        <p className="text-gray-400 text-sm mt-1">Your viewer agent wallet balance is empty or processing has timed out.</p>
                    </div>
                )}

                {tokenError ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-4 text-center">
                        <p className="text-red-400 font-semibold">Failed to initialize viewing session</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-3 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-2 px-4 rounded-lg border border-zinc-700 transition-all"
                        >
                            Retry
                        </button>
                    </div>
                ) : !sessionId || !leaseReady ? (
                    <div className="flex items-center justify-center h-full text-zinc-500">
                        {sessionId ? 'Establishing payment lease...' : 'Initializing viewing session...'}
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        className="w-full h-full"
                        controls
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        src={`/api/stream?sessionId=${sessionId}&itemId=${id}`}
                    />
                )}
            </div>

            <div className="mt-4 text-sm text-zinc-500">
                Status: {isPlaying ? <span className="text-green-400">Streaming Micro-payments ($0.002 / min)</span> : "Paused"}
            </div>
        </div>
    );
}
