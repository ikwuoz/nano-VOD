'use client';
import { useEffect, useRef, useState, use } from 'react';

export default function WatchPortal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [paymentError, setPaymentError] = useState(false);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [leaseReady, setLeaseReady] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  const handlePaymentBlock = () => {
    setPaymentError(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let wId = sessionStorage.getItem('viewerWalletId');
      let cAddr = sessionStorage.getItem('creatorWalletAddress');

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
          amount: '0.000500',
        }),
      });
      if (cancelled) return;
      if (!payRes.ok) {
        if (payRes.status === 402) handlePaymentBlock();
        return;
      }
      setLeaseReady(true);

      const url = `/api/stream?sessionId=${tokenData.sessionId}&itemId=${id}`;
      try {
        const checkRes = await fetch(url, { headers: { 'Range': 'bytes=0-0' } });
        if (checkRes.status === 402 || checkRes.headers.get('X-Stream-Error')) {
          setStreamError('Stream source unavailable.');
          return;
        }
      } catch {
        setStreamError('Stream source unavailable.');
        return;
      }
      setStreamUrl(url);
    })();

    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    let paymentInterval: NodeJS.Timeout;

    const wId = sessionStorage.getItem('viewerWalletId');

    if (isPlaying && !paymentError && sessionId && wId) {
      const triggerMicroPayment = async () => {
        try {
          const res = await fetch('/api/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              viewerWalletId: wId,
              amount: '0.000500',
            }),
          });

          if (res.status === 402) {
            handlePaymentBlock();
          }
        } catch {
          handlePaymentBlock();
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
            <p className="text-red-500 font-semibold text-lg">&#9888;&#65039; HTTP 402: Payment Required</p>
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
        ) : streamError ? (
          <StreamErrorModal
            message={streamError}
            onCancel={() => window.location.href = '/'}
          />
        ) : !sessionId || !leaseReady ? (
          <div className="flex items-center justify-center h-full text-zinc-500">
            {sessionId ? 'Establishing payment lease...' : 'Initializing viewing session...'}
          </div>
        ) : !streamUrl ? (
          <div className="flex items-center justify-center h-full text-zinc-500">
            Checking stream availability...
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full"
            controls
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => setStreamError('Stream source unavailable. The Jellyfin tunnel may be down or the CDN fallback failed.')}
            src={streamUrl}
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

function StreamErrorModal({ message, onCancel }: { message: string; onCancel: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 p-6 text-center">
      <div className="max-w-sm w-full bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p className="text-red-400 font-semibold text-lg mb-2">Stream Error</p>
        <p className="text-zinc-400 text-sm mb-6">{message}</p>
        <button
          onClick={onCancel}
          className="w-full text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-2.5 px-4 rounded-lg border border-zinc-700 transition-all"
        >
          Cancel &amp; Go Home
        </button>
      </div>
    </div>
  );
}
