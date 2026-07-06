'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui';

type Analytics = {
    totalPayments: number;
    totalRevenue: string;
    totalRuntimeMs: number;
    totalRuntimeMin: string;
    totalSessions: number;
    errors: Record<string, number>;
    totalErrors: number;
    errorRate: string;
    latency: Record<string, { avgMs: number; count: number }>;
    sources: Record<string, number>;
    perFilm: Record<string, { payments: number; revenue: string }>;
    heartbeats: number;
    clientEvents: Record<string, number>;
};

const FILM_TITLES: Record<string, string> = {
    'big-buck-bunny': 'Big Buck Bunny',
    'sintel': 'Sintel',
    'stub-cosmos': 'Beyond the Cosmos',
    'stub-neon': 'Neon Dynasty',
    'stub-coral': 'Coral Refuge',
    'stub-mirage': 'Mirage Motel',
    'stub-aurora': 'Aurora Rising',
    'stub-steel': 'Steel Horizon',
    'stub-velvet': 'Velvet Underground',
    'stub-pixel': 'Pixel Dreams',
    'stub-fractal': 'Fractal',
    'stub-wildfire': 'Wildfire',
    'stub-lume': 'Lumiere',
    'stub-terminal': 'Terminal Velocity',
};

function msLabel(ms: number) { return `${ms} ms`; }

export default function DashboardPage() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('/api/analytics');
                if (res.ok) setAnalytics(await res.json());
            } catch {
                // ignore
            }
        };

        fetchAnalytics();
        const id = setInterval(fetchAnalytics, 5000);
        return () => clearInterval(id);
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', padding: 'var(--space-6)', fontFamily: 'var(--font-sans)' }}>
            <div style={{ maxWidth: 840, margin: '0 auto' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 600, letterSpacing: 'var(--tracking-tight)', marginBottom: 'var(--space-6)' }}>
                    Creator Dashboard
                </h1>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
                    <Card padding="sm">
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)', marginBottom: 'var(--space-1)' }}>
                            Total Revenue
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text-primary)', marginTop: 'var(--space-1)', fontFeatureSettings: '"tnum" 1, "zero" 1' }}>
                            {analytics ? `${analytics.totalRevenue} USDC` : '\u2014'}
                        </div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-quaternary)', marginTop: 'var(--space-1)' }}>
                            Streaming earnings
                        </div>
                    </Card>

                    <Card padding="sm">
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)', marginBottom: 'var(--space-1)' }}>
                            Transactions
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text-primary)', marginTop: 'var(--space-1)', fontFeatureSettings: '"tnum" 1, "zero" 1' }}>
                            {analytics ? String(analytics.totalPayments) : '\u2014'}
                        </div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-quaternary)', marginTop: 'var(--space-1)' }}>
                            Micro-payments processed
                        </div>
                    </Card>

                    <Card padding="sm">
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)', marginBottom: 'var(--space-1)' }}>
                            Runtime Watched
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text-primary)', marginTop: 'var(--space-1)', fontFeatureSettings: '"tnum" 1, "zero" 1' }}>
                            {analytics ? `${analytics.totalRuntimeMin} min` : '\u2014'}
                        </div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-quaternary)', marginTop: 'var(--space-1)' }}>
                            Total playback time
                        </div>
                    </Card>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                    <Card padding="sm">
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)', marginBottom: 'var(--space-1)' }}>
                            Error Rate
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 600, color: analytics && parseFloat(analytics.errorRate) > 5 ? 'var(--danger)' : 'var(--text-primary)', marginTop: 'var(--space-1)', fontFeatureSettings: '"tnum" 1, "zero" 1' }}>
                            {analytics ? `${analytics.errorRate}%` : '\u2014'}
                        </div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-quaternary)', marginTop: 'var(--space-1)' }}>
                            Of all requests
                        </div>
                    </Card>

                    <Card padding="sm">
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)', marginBottom: 'var(--space-1)' }}>
                            Total Errors
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 600, color: analytics && analytics.totalErrors > 0 ? 'var(--danger)' : 'var(--text-primary)', marginTop: 'var(--space-1)', fontFeatureSettings: '"tnum" 1, "zero" 1' }}>
                            {analytics ? String(analytics.totalErrors) : '\u2014'}
                        </div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-quaternary)', marginTop: 'var(--space-1)' }}>
                            Across all endpoints
                        </div>
                    </Card>

                    <Card padding="sm">
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)', marginBottom: 'var(--space-1)' }}>
                            Payment Heartbeats
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text-primary)', marginTop: 'var(--space-1)', fontFeatureSettings: '"tnum" 1, "zero" 1' }}>
                            {analytics ? String(analytics.heartbeats) : '\u2014'}
                        </div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-quaternary)', marginTop: 'var(--space-1)' }}>
                            Successful pay calls
                        </div>
                    </Card>

                    <Card padding="sm">
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)', marginBottom: 'var(--space-1)' }}>
                            Total Sessions
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text-primary)', marginTop: 'var(--space-1)', fontFeatureSettings: '"tnum" 1, "zero" 1' }}>
                            {analytics ? String(analytics.totalSessions) : '\u2014'}
                        </div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-quaternary)', marginTop: 'var(--space-1)' }}>
                            Viewing sessions started
                        </div>
                    </Card>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                    <Card padding="sm">
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)', marginBottom: 'var(--space-1)' }}>
                            Pay Latency
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text-primary)', marginTop: 'var(--space-1)', fontFeatureSettings: '"tnum" 1, "zero" 1' }}>
                            {analytics ? msLabel(analytics.latency.pay.avgMs) : '\u2014'}
                        </div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-quaternary)', marginTop: 'var(--space-1)' }}>
                            {analytics ? `${analytics.latency.pay.count} calls` : 'Avg response time'}
                        </div>
                    </Card>

                    <Card padding="sm">
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)', marginBottom: 'var(--space-1)' }}>
                            Stream Latency
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text-primary)', marginTop: 'var(--space-1)', fontFeatureSettings: '"tnum" 1, "zero" 1' }}>
                            {analytics ? msLabel(analytics.latency.stream.avgMs) : '\u2014'}
                        </div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-quaternary)', marginTop: 'var(--space-1)' }}>
                            {analytics ? `${analytics.latency.stream.count} calls` : 'Avg response time'}
                        </div>
                    </Card>

                    <Card padding="sm">
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)', marginBottom: 'var(--space-1)' }}>
                            Token Latency
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text-primary)', marginTop: 'var(--space-1)', fontFeatureSettings: '"tnum" 1, "zero" 1' }}>
                            {analytics ? msLabel(analytics.latency.token.avgMs) : '\u2014'}
                        </div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-quaternary)', marginTop: 'var(--space-1)' }}>
                            {analytics ? `${analytics.latency.token.count} calls` : 'Avg response time'}
                        </div>
                    </Card>
                </div>

                <Card padding="sm" style={{ marginTop: 'var(--space-4)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)', marginBottom: 'var(--space-2)' }}>
                        Error Breakdown
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontFeatureSettings: '"tnum" 1, "zero" 1' }}>
                        <div>402 Lease Expired: <span style={{ color: analytics && analytics.errors['402_lease_expired'] > 0 ? 'var(--danger)' : 'inherit', fontWeight: 600 }}>{analytics ? analytics.errors['402_lease_expired'] : '\u2014'}</span></div>
                        <div>402 Cap Exceeded: <span style={{ color: analytics && analytics.errors['402_cap_exceeded'] > 0 ? 'var(--danger)' : 'inherit', fontWeight: 600 }}>{analytics ? analytics.errors['402_cap_exceeded'] : '\u2014'}</span></div>
                        <div>402 Payment Fail: <span style={{ color: analytics && analytics.errors['402_payment_failed'] > 0 ? 'var(--danger)' : 'inherit', fontWeight: 600 }}>{analytics ? analytics.errors['402_payment_failed'] : '\u2014'}</span></div>
                        <div>402 Other: <span style={{ color: analytics && analytics.errors['402_other'] > 0 ? 'var(--danger)' : 'inherit', fontWeight: 600 }}>{analytics ? analytics.errors['402_other'] : '\u2014'}</span></div>
                        <div>Stream Fail: <span style={{ color: analytics && analytics.errors['stream_fail'] > 0 ? 'var(--danger)' : 'inherit', fontWeight: 600 }}>{analytics ? analytics.errors['stream_fail'] : '\u2014'}</span></div>
                        <div>Token Fail: <span style={{ color: analytics && analytics.errors['token_fail'] > 0 ? 'var(--danger)' : 'inherit', fontWeight: 600 }}>{analytics ? analytics.errors['token_fail'] : '\u2014'}</span></div>
                        <div>Wallet Fail: <span style={{ color: analytics && analytics.errors['wallet_fail'] > 0 ? 'var(--danger)' : 'inherit', fontWeight: 600 }}>{analytics ? analytics.errors['wallet_fail'] : '\u2014'}</span></div>
                        <div>Server Error: <span style={{ color: analytics && analytics.errors['server_error'] > 0 ? 'var(--danger)' : 'inherit', fontWeight: 600 }}>{analytics ? analytics.errors['server_error'] : '\u2014'}</span></div>
                    </div>
                </Card>

                {analytics && Object.keys(analytics.perFilm).length > 0 && (
                    <Card padding="sm" style={{ marginTop: 'var(--space-4)' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)', marginBottom: 'var(--space-2)' }}>
                            Per-Film Revenue
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontFeatureSettings: '"tnum" 1, "zero" 1' }}>
                            {Object.entries(analytics.perFilm)
                                .sort(([, a], [, b]) => b.payments - a.payments)
                                .map(([id, data]) => (
                                    <div key={id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-1) 0', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{FILM_TITLES[id] ?? id}</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{data.payments} tx &middot; {data.revenue} USDC</span>
                                    </div>
                                ))}
                        </div>
                    </Card>
                )}

                <div style={{ marginTop: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-quaternary)' }}>
                    <span>Jellyfin served: {analytics ? String(analytics.sources.jellyfin) : '\u2014'}</span>
                    <span>&bull;</span>
                    <span>Demo served: {analytics ? String(analytics.sources.demo) : '\u2014'}</span>
                </div>
            </div>
        </div>
    );
}
