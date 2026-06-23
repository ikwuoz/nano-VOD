'use client';
import { useEffect, useState } from 'react';

type Metrics = {
    totalPayments: number;
    totalRevenue: string;
    totalRuntimeMs: number;
    totalRuntimeMin: string;
    totalSessions: number;
};

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<Metrics | null>(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await fetch('/api/metrics');
                if (res.ok) setMetrics(await res.json());
            } catch {
                // ignore
            }
        };

        fetchMetrics();
        const id = setInterval(fetchMetrics, 5000);
        return () => clearInterval(id);
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', padding: 'var(--space-6)', fontFamily: 'var(--font-sans)' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-tight)', marginBottom: 'var(--space-6)' }}>
                Creator Dashboard
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', maxWidth: 760 }}>
                <StatCard
                    label="Total Revenue"
                    value={metrics ? `${metrics.totalRevenue} USDC` : '—'}
                    sub="Streaming earnings"
                />
                <StatCard
                    label="Transactions"
                    value={metrics ? String(metrics.totalPayments) : '—'}
                    sub="Micro-payments processed"
                />
                <StatCard
                    label="Runtime Watched"
                    value={metrics ? `${metrics.totalRuntimeMin} min` : '—'}
                    sub="Total playback time"
                />
            </div>

            <p style={{ marginTop: 'var(--space-8)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-quaternary)' }}>
                Total viewing sessions: {metrics?.totalSessions ?? '—'}
            </p>
        </div>
    );
}

function StatCard({
    label,
    value,
    sub,
}: {
    label: string;
    value: string;
    sub: string;
}) {
    return (
        <div style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--elev-card)',
            padding: 'var(--space-4)',
        }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)', marginBottom: 'var(--space-1)' }}>
                {label}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', marginTop: 'var(--space-1)', fontFeatureSettings: '"tnum" 1, "zero" 1' }}>
                {value}
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-quaternary)', marginTop: 'var(--space-1)' }}>
                {sub}
            </p>
        </div>
    );
}
