import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth-helpers';
import { hashPassword, verifyPassword } from '@/lib/auth';

const idSchema = z.string().uuid();

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  displayName: z.string().min(1).optional(),
  currentPassword: z.string().min(8).optional(),
  newPassword: z.string().min(8).optional()
}).refine((data) => {
  if (data.newPassword) {
    return !!data.currentPassword;
  }
  return true;
}, { message: 'Current password required to set a new password' });

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request as Request & { headers: Headers });
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const parsedId = idSchema.safeParse(params.id);
    if (!parsedId.success) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }

    if (parsedId.data !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, displayName: true, createdAt: true, updatedAt: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request as Request & { headers: Headers });
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const parsedId = idSchema.safeParse(params.id);
    if (!parsedId.success) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }

    if (parsedId.data !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parsedBody = updateUserSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({ success: false, error: parsedBody.error.errors[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (parsedBody.data.email && parsedBody.data.email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: parsedBody.data.email } });
      if (existing) {
        return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 409 });
      }
    }

    let passwordHash = user.passwordHash;
    if (parsedBody.data.newPassword) {
      const valid = await verifyPassword(parsedBody.data.currentPassword || '', user.passwordHash);
      if (!valid) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
      }
      passwordHash = await hashPassword(parsedBody.data.newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        email: parsedBody.data.email ?? user.email,
        displayName: parsedBody.data.displayName ?? user.displayName,
        passwordHash
      },
      select: { id: true, email: true, displayName: true, createdAt: true, updatedAt: true }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request as Request & { headers: Headers });
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const parsedId = idSchema.safeParse(params.id);
    if (!parsedId.success) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }

    if (parsedId.data !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}
