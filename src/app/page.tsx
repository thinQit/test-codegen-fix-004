'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
  createdAt?: string;
}

interface DashboardSummary {
  counts: { todo: number; in_progress: number; done: number };
  overdue: number;
  upcoming: Task[];
}

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const [period, setPeriod] = useState<7 | 30>(7);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null), []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      setSummary(null);
      return;
    }

    const fetchSummary = async () => {
      setLoading(true);
      const { data, error: apiError } = await api.get<DashboardSummary>(`/api/dashboard/summary?period=${period}`);
      if (apiError || !data) {
        setError(apiError || 'Unable to load dashboard.');
        setSummary(null);
      } else {
        setSummary(data);
        setError(null);
      }
      setLoading(false);
    };

    fetchSummary();
  }, [isAuthenticated, period]);

  useEffect(() => {
    if (!token) return;
  }, [token]);

  if (!isAuthenticated) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <h1 className="text-xl font-semibold">Welcome to Task Manager</h1>
          <p className="text-sm text-secondary">Log in to access your personalized dashboard.</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Link href="/login">
            <Button>Log In</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">Create Account</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-secondary">Overview of your tasks and upcoming priorities.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={period === 7 ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setPeriod(7)}
          >
            Last 7 days
          </Button>
          <Button
            variant={period === 30 ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setPeriod(30)}
          >
            Last 30 days
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {!loading && error && (
        <Card>
          <CardContent>
            <p className="text-sm text-error">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && summary && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-medium text-secondary">To Do</h2>
              <p className="text-2xl font-semibold">{summary.counts.todo}</p>
            </CardHeader>
            <CardContent>
              <Link className="text-sm text-primary hover:underline" href="/tasks?status=todo">
                View tasks
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-sm font-medium text-secondary">In Progress</h2>
              <p className="text-2xl font-semibold">{summary.counts.in_progress}</p>
            </CardHeader>
            <CardContent>
              <Link className="text-sm text-primary hover:underline" href="/tasks?status=in_progress">
                View tasks
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-sm font-medium text-secondary">Done</h2>
              <p className="text-2xl font-semibold">{summary.counts.done}</p>
            </CardHeader>
            <CardContent>
              <Link className="text-sm text-primary hover:underline" href="/tasks?status=done">
                View tasks
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && !error && summary && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Upcoming tasks</h2>
                <Badge variant={summary.overdue > 0 ? 'warning' : 'success'}>
                  {summary.overdue} overdue
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {summary.upcoming.length === 0 ? (
                <p className="text-sm text-secondary">No upcoming tasks for this period.</p>
              ) : (
                <ul className="space-y-3">
                  {summary.upcoming.map((task) => (
                    <li key={task.id} className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-xs text-secondary">
                          Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <Link href={`/tasks/${task.id}`} className="text-sm text-primary hover:underline">
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Quick actions</h2>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Link href="/tasks/new">
                <Button fullWidth>Create a new task</Button>
              </Link>
              <Link href="/tasks">
                <Button variant="outline" fullWidth>
                  Browse all tasks
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
