'use client';
import { useEffect, useRef, useState, use } from 'react';
import Link from 'next/link';
import { Button, Badge, Modal, VideoPlayer } from '@/components/ui';
import { FILM_BY_ID } from '@/lib/catalog';
import type { Film } from '@/lib/catalog';

export default function WatchPortal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const film: Film | undefined = FILM_BY_ID[id];

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [paymentError, setPaymentError] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [leaseReady, setLeaseReady] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  const handlePaymentBlock = () => {
    setPaymentError(true);
    videoRef.current?.pause();
    try { navigator.sendBeacon('/api/analytics/event', new Blob([JSON.stringify({ event: 'client_402' })], { type: 'application/json' })); } catch {}
  };

  const sendEvent = (event: string) => {
    try { navigator.sendBeacon('/api/analytics/event', new Blob([JSON.stringify({ event })], { type: 'application/json' })); } catch {}
  };

  const handleMouseMove = () => {
    setShowOverlay(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (isPlaying) {
      hideTimer.current = setTimeout(() => setShowOverlay(false), 3000);
    }
  };

  useEffect(() => {
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, []);

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
          if (!cancelled) { setTokenError(true); sendEvent('client_token_error'); }
          return;
        }
      }

      if (!wId || !cAddr) {
        if (!cancelled) { setTokenError(true); sendEvent('client_token_error'); }
        return;
      }

      const tokenRes = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ viewerWalletId: wId, creatorWalletAddress: cAddr }),
      });
      if (!tokenRes.ok) {
        if (!cancelled) { setTokenError(true); sendEvent('client_token_error'); }
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
          filmId: id,
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
          sendEvent('client_stream_error');
          return;
        }
      } catch {
        setStreamError('Stream source unavailable.');
        sendEvent('client_stream_error');
        return;
      }
      setStreamUrl(url);
    })();

    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    let paymentInterval: ReturnType<typeof setInterval>;

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
              filmId: id,
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

  const hasStream = streamUrl && !streamError && !tokenError && !paymentError;

  useEffect(() => {
    if (hasStream && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [hasStream]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowOverlay(false)}
      style={{ position: 'relative', minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
    >
      {/* Video area — full viewport width */}
      <div style={{ position: 'relative', width: '100vw', aspectRatio: '16/9', background: 'var(--surface-inset)' }}>

        {/* Now Watching overlay bar */}
        <div className={`watch-overlay ${showOverlay ? 'watch-overlay-visible' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <Link href="/" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', opacity: 0.7, transition: 'opacity var(--dur-fast)' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </Link>

            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)' }} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-md)', color: '#fff', lineHeight: 1.2 }}>
                {film?.title ?? 'Now Watching'}
              </div>
              {film && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                  <span>{film.genre}</span>
                  <span>&bull;</span>
                  <span>{film.year}</span>
                  <span>&bull;</span>
                  <span>{film.duration}</span>
                </div>
              )}
            </div>

            <div style={{ flex: 'none' }}>
              {isPlaying ? (
                <Badge variant="value" size="sm" dot pulse>
                  Streaming $0.002/min
                </Badge>
              ) : (
                <Badge variant="default" size="sm">Paused</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Error: 402 Payment Required */}
        {paymentError && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)', zIndex: 10, padding: 'var(--space-4)', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--danger-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-3)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 'var(--text-lg)', color: 'var(--danger)' }}>
              HTTP 402: Payment Required
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)', maxWidth: 360 }}>
              Your viewer agent wallet balance is empty or the payment lease has expired.
            </div>
          </div>
        )}

        {/* Error: Token */}
        {tokenError && !paymentError && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)', zIndex: 10, padding: 'var(--space-4)', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--danger-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-3)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--danger)' }}>
              Failed to initialize viewing session
            </div>
            <div style={{ marginTop: 'var(--space-3)' }}>
              <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Error: Stream */}
        {streamError && !tokenError && !paymentError && (
          <Modal open title="Stream Error" onClose={() => window.location.href = '/'}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--danger-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                {streamError}
              </div>
              <Button variant="danger" onClick={() => window.location.href = '/'}>
                Cancel &amp; Go Home
              </Button>
            </div>
          </Modal>
        )}

        {/* Loading skeleton */}
        {!hasStream && !tokenError && !streamError && !paymentError && (
          <div className="watch-skeleton">
            <div className="watch-skeleton-pulse" />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--text-tertiary)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)' }}>
                {!sessionId ? 'Initializing viewing session...' : !leaseReady ? 'Establishing payment lease...' : 'Checking stream availability...'}
              </div>
            </div>
          </div>
        )}

        {/* Video player */}
        {hasStream && (
          <>
            <VideoPlayer
              src={streamUrl}
              videoRef={videoRef}
              overlayVisible={showOverlay}
              onPlay={() => { setIsPlaying(true); setShowOverlay(true); sendEvent('play_started'); }}
              onPause={() => { setIsPlaying(false); setShowOverlay(true); sendEvent('play_paused'); }}
              onEnded={() => { setVideoEnded(true); sendEvent('video_ended'); }}
              onError={(msg) => setStreamError(msg)}
            />

            {/* Video ended overlay */}
            {videoEnded && (
              <div className="watch-ended-overlay">
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-1)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-xl)', color: '#fff' }}>
                  Playback Complete
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                  {film?.title ?? 'Thanks for watching!'}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <Button variant="secondary" onClick={() => { setVideoEnded(false); if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play(); } }}>
                    Watch Again
                  </Button>
                  <Link href="/">
                    <Button variant="primary">
                      Back to Browse
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Context footer */}
      {film && (
        <div style={{ padding: 'var(--space-6) var(--space-6)', maxWidth: 640 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-lg)', color: 'var(--text-primary)', margin: 0 }}>
            {film.title}
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)', lineHeight: 1.6 }}>
            {film.description}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-3)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-quaternary)' }}>
            <span>{film.creator}</span>
            <span>&bull;</span>
            <span>{film.rating}</span>
            <span>&bull;</span>
            <span>{film.year}</span>
          </div>
        </div>
      )}
    </div>
  );
}
