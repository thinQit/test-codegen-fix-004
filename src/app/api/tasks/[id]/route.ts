import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth-helpers';

const idSchema = z.string().uuid();

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  tags: z.array(z.string().min(1)).optional()
});

function serializeTags(tags?: string[]): string | null {
  if (!tags || tags.length === 0) return null;
  return tags.map(tag => tag.trim()).filter(Boolean).join(',');
}

function deserializeTags(tags?: string | null): string[] {
  if (!tags) return [];
  return tags.split(',').map(tag => tag.trim()).filter(Boolean);
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const parsedId = idSchema.safeParse(params.id);
    if (!parsedId.success) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }

    const task = await prisma.task.findFirst({
      where: { id: parsedId.data, ownerId: userId }
    });

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { ...task, tags: deserializeTags(task.tags) }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request as Reque
... [truncated]