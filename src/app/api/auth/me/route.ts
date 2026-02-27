import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request as Request & { headers: Headers });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}
