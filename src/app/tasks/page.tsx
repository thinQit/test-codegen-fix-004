'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';

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

interface TaskListResponse {
  items: Task[];
  total: number;
  page: number;
  limit: number;
}

const statusOptions = ['todo', 'in_progress', 'done'] as const;
const priorityOptions = ['low', 'medium', 'high'] as const;

export default function TasksPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    tags: searchParams.get('tags') || '',
    sortBy: searchParams.get('sortBy') || 'dueDate',
    sortDir: searchParams.get('sortDir') || 'asc',
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<TaskListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.tags) params.set('tags', filters.tags);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortDir) params.set('sortDir', filters.sortDir);
    params.set('page', page.toString());
    params.set('limit', '10');
    return params.toString();
  }, [filters, page]);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const { data: response, error: apiError } = await api.get<TaskListResponse>(`/api/tasks?${queryString}`);
      if (apiError || !response) {
        setError(apiError || 'Unable to load tasks.');
        setData(null);
      } else {
        setData(response);
        setError(null);
      }
      setLoading(false);
    };

    fetchTasks();
  }, [queryString]);

  const handleFilterChange = (key: keyof typeof filters) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-sm text-secondary">Filter, sort, and manage your tasks.</p>
        </div>
        <Link href="/tasks/new">
          <Button>Create Task</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-medium text-secondary">Filters</h2>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1">
            <label className="text-sm font-medium">Status</label>
            <select
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
              value={filters.status}
              onChange={handleFilterChange('status')}
            >
              <option value="">All</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Priority</label>
            <select
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
              value={filters.priority}
              onChange={handleFilterChange('priority')}
            >
              <option value="">All</option>
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Tags (comma separated)"
            value={filters.tags}
            onChange={handleFilterChange('tags')}
            placeholder="work, personal"
          />
          <div className="space-y-1">
            <label className="text-sm font-medium">Sort by</label>
            <select
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
              value={filters.sortBy}
              onChange={handleFilterChange('sortBy')}
            >
              <option value="dueDate">Due date</option>
              <option value="createdAt">Created date</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Direction</label>
            <select
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
              value={filters.sortDir}
              onChange={handleFilterChange('sortDir')}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </CardContent>
      </Card>

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

      {!loading && !error && data && data.items.length === 0 && (
        <Card>
          <CardContent>
            <p className="text-sm text-secondary">No tasks match your filters.</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && data && data.items.length > 0 && (
        <div className="space-y-4">
          {data.items.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    <p className="text-sm text-secondary">
                      Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={task.status === 'done' ? 'success' : task.status === 'in_progress' ? 'warning' : 'default'}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'secondary'}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-secondary">{task.description || 'No description provided.'}</p>
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <Link href={`/tasks/${task.id}`} className="text-sm text-primary hover:underline">
                  View details
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && data && data.items.length > 0 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <p className="text-sm text-secondary">
            Page {data.page} of {totalPages}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
