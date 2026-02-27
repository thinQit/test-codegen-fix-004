import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth-helpers';

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  tags: z.array(z.string().min(1)).optional()
});

const listQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  tags: z.string().optional(),
  sortBy: z.enum(['dueDate', 'createdAt']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional()
});

function serializeTags(tags?: string[]): string | null {
  if (!tags || tags.length === 0) return null;
  return tags.map(tag => tag.trim()).filter(Boolean).join(',');
}

function deserializeTags(tags?: string | null): string[] {
  if (!tags) return [];
  return tags.split(',').map(tag => tag.trim()).filter(Boolean);
}

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request as Request & { headers: Headers });
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const params = Object.fromEntries(new URL(request.url).searchParams.entries());
    const parsed = listQuerySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid query' }, { status: 400 });
    }

    const page = Math.max(1, Number(parsed.data.page || 1));
    const limit = Math.min(100, Math.max(1, Number(parsed.data.limit || 10)));
    const sortBy = parsed.data.sortBy || 'createdAt';
    const sortDir = parsed.data.sortDir || 'desc';

    const tagsFilter = parsed.data.tags
      ? parsed.data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    const andFilters = tagsFilter.map(tag => ({ tags: { contains: tag } }));

    const where = {
      ownerId: userId,
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.priority ? { priority: parsed.data.priority } : {}),
      ...(andFilters.length > 0 ? { AND: andFilters } : {})
    };

    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.task.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: items.map(task => ({
          ...task,
          tags: deserializeTags(task.tags)
        })),
        total,
        page,
        limit
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request as Request & { headers: Headers });
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        ownerId: userId,
        title: parsed.data.title,
        description: parsed.data.description || null,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        priority: parsed.data.priority || 'medium',
        status: 'todo',
        tags: serializeTags(parsed.data.tags)
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...task,
        tags: deserializeTags(task.tags)
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}
