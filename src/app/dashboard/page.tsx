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
        <div className="min-h-screen bg-black text-white p-6">
            <h1 className="text-2xl font-bold mb-6">Creator Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
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

            <p className="mt-8 text-xs text-zinc-600">
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
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
            <p className="text-xl font-semibold mt-1 font-mono">{value}</p>
            <p className="text-xs text-zinc-600 mt-1">{sub}</p>
        </div>
    );
}
