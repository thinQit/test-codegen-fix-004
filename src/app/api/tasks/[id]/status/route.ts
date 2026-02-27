import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth-helpers';

const idSchema = z.string().uuid();
const statusSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done'])
});

function deserializeTags(tags?: string | null): string[] {
  if (!tags) return [];
  return tags.split(',').map(tag => tag.trim()).filter(Boolean);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request as Request & { headers: Headers });
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const parsedId = idSchema.safeParse(params.id);
    if (!parsedId.success) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }

    const body = await request.json();
    const parsedBody = statusSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const existing = await prisma.task.findFirst({
      where: { id: parsedId.data, ownerId: userId }
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id: existing.id },
      data: {
        status: parsedBody.data.status,
        completedAt: parsedBody.data.status === 'done' ? new Date() : null
      }
    });

    return NextResponse.json({
      success: true,
      data: { ...task, tags: deserializeTags(task.tags) }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}
