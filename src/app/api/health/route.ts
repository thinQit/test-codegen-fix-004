import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    await prisma.user.findFirst();
    return NextResponse.json({
      success: true,
      data: {
        status: 'ok',
        uptimeSeconds: Math.floor(process.uptime()),
        db: 'ok'
      }
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Database unreachable'
    }, { status: 503 });
  }
}
