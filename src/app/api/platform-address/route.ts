import { NextResponse } from 'next/server';
import { getPlatformFeeAddress } from '@/app/api/wallet/provision/route';

export async function GET() {
  const address = await getPlatformFeeAddress();
  return NextResponse.json({ address });
}
