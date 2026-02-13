import { NextRequest, NextResponse } from 'next/server';
import { checkExistingUser } from '@/lib/sync/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    if (apiKey.length < 10) {
      return NextResponse.json(
        { error: 'Invalid API key format' },
        { status: 400 }
      );
    }

    const userId = await checkExistingUser(apiKey.trim());

    return NextResponse.json({
      exists: !!userId,
      userId: userId ?? undefined,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
