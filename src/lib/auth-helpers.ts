import type { NextRequest } from 'next/server';
import { getTokenFromHeader, verifyToken } from './auth';
import { prisma } from './db';

export function getUserIdFromRequest(request: NextRequest): string | null {
  const token = getTokenFromHeader(request.headers.get('authorization'));
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, displayName: true, createdAt: true, updatedAt: true }
  });
}
