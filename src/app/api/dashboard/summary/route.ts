import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth-helpers';

const querySchema = z.object({
  period: z.enum(['7', '30']).optional()
});

function deserializeTags(tags?: string | null): string[] {
  if (!tags) return [];
  return tags.split(',').map(tag => tag.trim()).filter(Boolean);
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const params = Object.fromEntries(new URL(request.url).searchParams.entries());
    const parsed = querySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid query' }, { status: 400 });
    }

    const periodDays = parsed.data.period ? Number(parsed.data.period) : 7;
    const now = new Date();
    const upcomingLimit = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

    const [todo, inProgress, done, overdue, upcoming] = await Promise.all([
      prisma.task.count({ where: { ownerId: userId, status: 'todo' } }),
      prisma.task.count({ where: { ownerId: userId, status: 'in_progress' } }),
      prisma.task.count({ where: { ownerId: userId, status: 'done' } }),
      prisma.task.count({
        where: { ownerId: userId, status: { not: 'done' }, dueDate: { lt: now } }
      }),
      prisma.task.findMany({
        where: { ownerId: userId, status: { not: 'done' }, dueDate: { gte: now, lte: upcomingLimit } },
        orderBy: { dueDate: 'asc' },
        take: 5
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          todo,
          in_progress: inProgress,
          done
        },
        overdue,
        upcoming: upcoming.map(task => ({
          ...task,
          tags: deserializeTags(task.tags)
        }))
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
