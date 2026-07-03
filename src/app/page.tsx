'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button, Badge, StatusDot, HeroSection, FilmRow, FilmPoster } from '@/components/ui';
import { FILM_CATALOG, getCategoryFilms, CATEGORIES } from '@/lib/catalog';
import type { CategoryKey } from '@/lib/catalog';

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
  useEffect(() => {
    const viewerId = localStorage.getItem('viewerId');

    const stored = sessionStorage.getItem('testWallet');
    if (stored) {
      try {
        queueMicrotask(() => setTestWallet(JSON.parse(stored)));
      } catch {}
    }

    if (!viewerId) return;

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

  const bootstrapUserWallet = useCallback(async () => {
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
  }, []);

  const featured = FILM_CATALOG.find((f) => f.featured);
  const categoryFilms = getCategoryFilms();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>

      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8, 10, 17, 0.8)',
        backdropFilter: 'var(--blur-panel)',
        WebkitBackdropFilter: 'var(--blur-panel)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ maxWidth: 'var(--container-2xl)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--gutter-page)', height: 'var(--topbar-height)' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
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
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-md)', color: 'var(--text-primary)', letterSpacing: 'var(--tracking-tight)', lineHeight: 1, margin: 0 }}>
                nano VOD
              </h1>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-quaternary)', lineHeight: 1, marginTop: 2, textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)' }}>
                Metered streaming for Jellyfin
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {!testWallet ? (
              <Button
                onClick={bootstrapUserWallet}
                disabled={isProvisioning}
                loading={isProvisioning}
              >
                Launch Wallet
              </Button>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                background: 'var(--surface-2)',
                border: '1px solid var(--border-brand)',
                borderRadius: 'var(--radius-md)',
                padding: '0 var(--space-3)', height: 34,
              }}>
                <StatusDot status="active" pulse />
                <Badge variant="default" size="sm">
                  {testWallet.address.slice(0, 6)}&hellip;{testWallet.address.slice(-4)}
                </Badge>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {parseFloat(testWallet.balance).toFixed(2)} USDC
                </span>
              </div>
            )}

            <Link href="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Button
                variant="ghost"
                size="sm"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                }
              />
            </Link>
          </div>
        </div>
      </nav>

      {featured && <HeroSection film={featured} />}

      <div style={{ padding: 'var(--space-8) var(--gutter-page)' }}>
        <main style={{ maxWidth: 'var(--container-2xl)', margin: '0 auto' }}>
          {CATEGORIES.map((cat) => {
            const films = categoryFilms[cat.key as CategoryKey];
            if (!films.length) return null;
            return (
              <FilmRow key={cat.key} label={cat.label}>
                {films.map((film) => (
                  <FilmPoster key={film.id} film={film} />
                ))}
              </FilmRow>
            );
          })}
        </main>
      </div>
    </div>
  );
}
