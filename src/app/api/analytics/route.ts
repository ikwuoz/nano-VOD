import { NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/metrics';

export async function GET() {
  const analytics = await getAnalytics();
  return NextResponse.json(analytics);
}
