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
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">

      <nav className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-3.5">

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-100 font-bold text-sm">
              A
            </div>
            <div>
              <h1 className="text-base font-semibold text-zinc-100 leading-tight">nano VOD</h1>
              <p className="text-[10px] text-zinc-500 leading-tight">Metered streaming for Jellyfin</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!testWallet ? (
              <button
                onClick={bootstrapUserWallet}
                disabled={isProvisioning}
                className="text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProvisioning ? 'Initializing…' : 'Launch Wallet'}
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono text-zinc-400">
                  {testWallet.address.slice(0, 6)}&hellip;{testWallet.address.slice(-4)}
                </span>
                <span className="text-xs font-medium text-zinc-100">{parseFloat(testWallet.balance).toFixed(2)} USDC</span>
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors rounded-lg hover:bg-zinc-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1 min-w-[160px]">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
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

      <div className="p-8">
        <main className="max-w-6xl mx-auto">
          <h2 className="text-lg font-bold mb-6 text-zinc-300 tracking-wide uppercase">Available Premium In-Network Libraries</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FILM_CATALOG.map((film) => (
              <div
                key={film.id}
                className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl transition-all duration-200 hover:border-zinc-700 hover:scale-[1.01]"
              >
                <div className="relative aspect-video w-full bg-zinc-800 overflow-hidden">
                  <Image
                    src={film.thumbnail}
                    alt={film.title}
                    fill
                    loading="eager"
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <span className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-[11px] font-bold text-teal-400 px-2.5 py-1 rounded-full border border-teal-500/20">
                    ${parseFloat(film.ratePerMin)} USDC / min
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                    <span>{film.genre}</span>
                    <span>&bull;</span>
                    <span>{film.duration}</span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-100 group-hover:text-white transition-colors">
                    {film.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 mb-6">
                    Published by <span className="text-zinc-300 font-medium">{film.creator}</span>
                  </p>

                  <Link
                    href={`/watch/${film.id}`}
                    className="inline-flex w-full items-center justify-center font-medium text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-2.5 px-4 rounded-lg border border-zinc-700 transition-all"
                  >
                    Enter Secured Metered Stream &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
