import { NextRequest, NextResponse } from 'next/server';
import { checkConnectionStatus } from '@/lib/nango-server';

export async function POST(request: NextRequest) {
  try {
    const { integrationId, userId } = await request.json();

    if (!integrationId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: integrationId and userId' },
        { status: 400 }
      );
    }

    const status = await checkConnectionStatus(integrationId, userId);

    return NextResponse.json(status);
  } catch (error) {
    console.error('Connection check error:', error);
    return NextResponse.json(
      { error: 'Failed to check connection', connected: false },
      { status: 500 }
    );
  }
}

