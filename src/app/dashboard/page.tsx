'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui';

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
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 600, letterSpacing: 'var(--tracking-tight)', marginBottom: 'var(--space-6)' }}>
                Creator Dashboard
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', maxWidth: 760 }}>
                <Card padding="sm">
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)', marginBottom: 'var(--space-1)' }}>
                        Total Revenue
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text-primary)', marginTop: 'var(--space-1)', fontFeatureSettings: '"tnum" 1, "zero" 1' }}>
                        {metrics ? `${metrics.totalRevenue} USDC` : '\u2014'}
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
                        {metrics ? String(metrics.totalPayments) : '\u2014'}
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
                        {metrics ? `${metrics.totalRuntimeMin} min` : '\u2014'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-quaternary)', marginTop: 'var(--space-1)' }}>
                        Total playback time
                    </div>
                </Card>
            </div>

            <div style={{ marginTop: 'var(--space-8)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-quaternary)' }}>
                Total viewing sessions: {metrics?.totalSessions ?? '\u2014'}
            </div>
        </div>
    );
}
