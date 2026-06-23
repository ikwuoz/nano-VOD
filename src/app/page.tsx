'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Mock dynamic catalog optimized for independent film distribution
const FILM_CATALOG = [
  {
    id: 'big-buck-bunny',
    title: 'Big Buck Bunny (Open Source Indie)',
    creator: 'Blender Foundation',
    ratePerMin: '0.002000',
    duration: '10 min',
    genre: 'Animation',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=640&h=360&fit=crop'
  },
  {
    id: 'sintel',
    title: 'Sintel (Premium Cinema Asset)',
    creator: 'Durian Open Movie Project',
    ratePerMin: '0.002000',
    duration: '15 min',
    genre: 'Fantasy / Action',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=640&h=360&fit=crop'
  }
];

function applyWallet(
  data: { id: string; address: string; balance: string; platformFeeAddress: string },
  setTestWallet: (w: { id: string; address: string; balance: string } | null) => void,
) {
  const wallet = { id: data.id, address: data.address, balance: data.balance };
  setTestWallet(wallet);
  sessionStorage.setItem('testWallet', JSON.stringify(wallet));
  sessionStorage.setItem('viewerWalletId', data.id);
  sessionStorage.setItem('creatorWalletAddress', data.platformFeeAddress);
}

export default function HomeCatalog() {
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [testWallet, setTestWallet] = useState<{ id: string; address: string; balance: string } | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const viewerId = localStorage.getItem('viewerId');
    if (!viewerId) return;

    const stored = sessionStorage.getItem('testWallet');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTestWallet(parsed);
      } catch {}
    }

    (async () => {
      try {
        const walletId = sessionStorage.getItem('viewerWalletId');
        const res = await fetch('/api/wallet/provision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ viewerId, walletId }),
        });
        const data = await res.json();
        if (data.balance) {
          setTestWallet((prev) => prev ? { ...prev, balance: data.balance } : null);
        } else {
          console.warn('[balance-refresh] No balance in response:', res.status, data);
        }
      } catch (err) {
        console.warn('[balance-refresh] Fetch error:', err);
      }
    })();
  }, []);

  const bootstrapUserWallet = async () => {
    setIsProvisioning(true);
    try {
      let viewerId = localStorage.getItem('viewerId');
      if (!viewerId) {
        viewerId = crypto.randomUUID();
        localStorage.setItem('viewerId', viewerId);
      }
      const res = await fetch('/api/wallet/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ viewerId }),
      });
      const data = await res.json();
      if (data.id) applyWallet(data, setTestWallet);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8, 10, 17, 0.8)',
        backdropFilter: 'var(--blur-panel)',
        WebkitBackdropFilter: 'var(--blur-panel)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ maxWidth: 'var(--container-2xl)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--gutter-page)', height: 'var(--topbar-height)' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {/* Logo mark — using DS brand SVG */}
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="NanoVod" role="img">
              <defs>
                <linearGradient id="nv-mark-nav" x1="20" y1="6" x2="20" y2="34" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7CEBF4" /><stop offset="1" stopColor="#11B0C3" />
                </linearGradient>
              </defs>
              <path d="M30.24 11.99 A13 13 0 1 0 30.24 28.01" stroke="url(#nv-mark-nav)" strokeWidth="3.6" strokeLinecap="round" />
              <circle cx="30.24" cy="11.99" r="2.6" fill="#7CEBF4" />
              <circle cx="30.24" cy="28.01" r="2.6" fill="#1ED2E4" />
            </svg>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-md)', color: 'var(--text-primary)', letterSpacing: 'var(--tracking-tight)', lineHeight: 1, margin: 0 }}>
                nano VOD
              </h1>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-quaternary)', lineHeight: 1, marginTop: 2, textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)' }}>
                Metered streaming for Jellyfin
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {!testWallet ? (
              <button
                onClick={bootstrapUserWallet}
                disabled={isProvisioning}
                style={{
                  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)',
                  background: isProvisioning ? 'var(--brand-active)' : 'var(--brand)',
                  color: 'var(--on-brand)',
                  padding: '0 var(--space-4)', height: 34,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid transparent',
                  cursor: isProvisioning ? 'not-allowed' : 'pointer',
                  opacity: isProvisioning ? 0.7 : 1,
                  transition: 'background var(--dur-fast) var(--ease-out)',
                  display: 'inline-flex', alignItems: 'center',
                }}
              >
                {isProvisioning ? 'Initializing…' : 'Launch Wallet'}
              </button>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                background: 'var(--surface-2)',
                border: '1px solid var(--border-brand)',
                borderRadius: 'var(--radius-md)',
                padding: '0 var(--space-3)', height: 34,
              }}>
                <span className="nano-vod-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--value)', flex: 'none' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  {testWallet.address.slice(0, 6)}&hellip;{testWallet.address.slice(-4)}
                </span>
                <span className="text-xs font-medium text-zinc-100">{parseFloat(testWallet.balance).toFixed(2)} USDC</span>
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMenu((v) => !v)}
                style={{
                  width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: showMenu ? 'var(--surface-2)' : 'transparent',
                  border: '1px solid ' + (showMenu ? 'var(--border-default)' : 'transparent'),
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-tertiary)', cursor: 'pointer',
                  transition: 'background var(--dur-fast), color var(--dur-fast)',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>

              {showMenu && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowMenu(false)} />
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 50,
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--elev-popover)',
                    padding: 'var(--space-1)',
                    minWidth: 160,
                  }}>
                    <Link
                      href="/dashboard"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        transition: 'background var(--dur-fast), color var(--dur-fast)',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                      onClick={() => setShowMenu(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                      </svg>
                      Dashboard
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Catalog */}
      <div style={{ padding: 'var(--space-8) var(--gutter-page)' }}>
        <main style={{ maxWidth: 'var(--container-xl)', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)',
            color: 'var(--text-tertiary)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase',
            marginBottom: 'var(--space-6)',
          }}>
            Available Premium In-Network Libraries
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: 'var(--space-8)' }}>
            {FILM_CATALOG.map((film) => (
              <FilmCard key={film.id} film={film} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function FilmCard({ film }: { film: typeof FILM_CATALOG[0] }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--surface-1)',
        border: '1px solid ' + (hover ? 'var(--border-brand)' : 'var(--border-subtle)'),
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: hover ? 'var(--elev-panel), var(--glow-cyan-sm)' : 'var(--elev-card)',
        transform: hover ? 'translateY(-2px) scale(1.005)' : 'none',
        transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base), border-color var(--dur-base)',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '16/9', background: 'var(--surface-inset)', overflow: 'hidden' }}>
        <Image
          src={film.thumbnail}
          alt={film.title}
          fill
          loading="eager"
          style={{ objectFit: 'cover', opacity: hover ? 1 : 0.8, transition: 'opacity var(--dur-base)' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <span style={{
          position: 'absolute', top: 12, right: 12,
          display: 'inline-flex', alignItems: 'center',
          background: 'rgba(6,8,13,0.8)',
          backdropFilter: 'var(--blur-sm)',
          WebkitBackdropFilter: 'var(--blur-sm)',
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 'var(--weight-medium)',
          color: 'var(--text-brand)',
          padding: '0 10px', height: 24,
          borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(30,210,228,0.25)',
          fontFeatureSettings: '"tnum" 1',
        }}>
          ${parseFloat(film.ratePerMin)} USDC / min
        </span>
      </div>

      <div style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-quaternary)', marginBottom: 'var(--space-1)' }}>
          <span>{film.genre}</span>
          <span>&bull;</span>
          <span>{film.duration}</span>
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', letterSpacing: 'var(--tracking-tight)', transition: 'color var(--dur-fast)', margin: 0 }}>
          {film.title}
        </h3>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-quaternary)', marginTop: 'var(--space-1)', marginBottom: 'var(--space-6)' }}>
          Published by <span style={{ color: 'var(--text-secondary)', fontWeight: 'var(--weight-medium)' }}>{film.creator}</span>
        </p>

        <Link
          href={`/watch/${film.id}`}
          style={{
            display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)',
            background: 'var(--surface-2)',
            color: 'var(--text-primary)',
            height: 40,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            textDecoration: 'none',
            transition: 'background var(--dur-fast), border-color var(--dur-fast)',
            boxShadow: 'var(--edge-top)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)'; }}
        >
          Enter Secured Metered Stream &rarr;
        </Link>
      </div>
    </div>
  );
}
