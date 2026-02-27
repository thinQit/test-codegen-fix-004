import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: 'demo@example.com' } });
  if (existing) return;

  const passwordHash = await hashPassword('Password123!');
  const user = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      displayName: 'Demo User',
      passwordHash
    }
  });

  const now = new Date();
  await prisma.task.create({
    data: {
      ownerId: user.id,
      title: 'Finish onboarding checklist',
      description: 'Complete the initial project setup and review the README.',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      tags: 'work,urgent'
    }
  });

  await prisma.task.create({
    data: {
      ownerId: user.id,
      title: 'Plan weekly sprint',
      description: 'Identify top priorities for the next sprint.',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      tags: 'planning'
    }
  });

  await prisma.task.create({
    data: {
      ownerId: user.id,
      title: 'Pay utilities',
      description: 'Electricity and internet bills.',
      status: 'done',
      priority: 'low',
      completedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      tags: 'personal'
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
