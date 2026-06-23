import { NextResponse } from 'next/server';
import { getMetrics } from '@/lib/metrics';

export async function GET() {
    const metrics = await getMetrics();
    return NextResponse.json(metrics);
}
