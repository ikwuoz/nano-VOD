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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', padding: 'var(--space-6)', fontFamily: 'var(--font-sans)' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-tight)', marginBottom: 'var(--space-4)' }}>
                nano VOD Portal
            </h1>

            <div style={{
                position: 'relative', width: '100%', maxWidth: 896, aspectRatio: '16/9',
                background: 'var(--surface-inset)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: paymentError
                    ? '1px solid rgba(255,77,94,0.45)'
                    : leaseReady
                        ? '1px solid var(--border-brand)'
                        : '1px solid var(--border-subtle)',
                boxShadow: paymentError
                    ? 'var(--elev-panel), var(--glow-red)'
                    : leaseReady
                        ? 'var(--elev-panel), var(--glow-cyan-sm)'
                        : 'var(--elev-panel)',
                transition: 'border-color var(--dur-slow), box-shadow var(--dur-slow)',
            }}>
                {paymentError && (
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(6,8,13,0.9)',
                        backdropFilter: 'var(--blur-panel)',
                        WebkitBackdropFilter: 'var(--blur-panel)',
                        zIndex: 10, padding: 'var(--space-4)', textAlign: 'center',
                    }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-lg)', color: 'var(--red-400)', marginBottom: 'var(--space-2)' }}>
                            HTTP 402: Payment Required
                        </p>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                            Your viewer agent wallet balance is empty or processing has timed out.
                        </p>
                    </div>
                )}

                {tokenError ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 'var(--space-4)', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--weight-semibold)', color: 'var(--red-400)', marginBottom: 'var(--space-3)' }}>
                            Failed to initialize viewing session
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)',
                                background: 'var(--surface-2)', color: 'var(--text-primary)',
                                padding: '0 var(--space-4)', height: 34,
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-default)',
                                cursor: 'pointer',
                                transition: 'background var(--dur-fast), border-color var(--dur-fast)',
                                boxShadow: 'var(--edge-top)',
                            }}
                        >
                            Retry
                        </button>
                    </div>
                ) : !sessionId || !leaseReady ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-quaternary)' }}>
                        {sessionId ? 'Establishing payment lease...' : 'Initializing viewing session...'}
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        style={{ width: '100%', height: '100%', display: 'block' }}
                        controls
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        src={`/api/stream?sessionId=${sessionId}&itemId=${id}`}
                    />
                )}
            </div>

            <div style={{ marginTop: 'var(--space-4)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-quaternary)' }}>
                Status:{' '}
                {isPlaying ? (
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-value)', fontFeatureSettings: '"tnum" 1' }}>
                        Streaming Micro-payments ($0.002 / min)
                    </span>
                ) : (
                    <span>Paused</span>
                )}
            </div>
        </div>
    );
}
