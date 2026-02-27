'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const taskId = params?.id as string;
  const [task, setTask] = useState<Task | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo',
    tags: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;
    const fetchTask = async () => {
      setLoading(true);
      const { data, error: apiError } = await api.get<Task>(`/api/tasks/${taskId}`);
      if (apiError || !data) {
        setError(apiError || 'Unable to load task.');
        setTask(null);
      } else {
        setTask(data);
        setForm({
          title: data.title,
          description: data.description || '',
          dueDate: data.dueDate ? data.dueDate.slice(0, 10) : '',
          priority: data.priority,
          status: data.status,
          tags: data.tags ? data.tags.join(', ') : '',
        });
        setError(null);
      }
      setLoading(false);
    };

    fetchTask();
  }, [taskId]);

  const handleChange = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!task) return;
    setSaving(true);
    setError(null);

    const payload = {
      title: form.title,
      description: form.description || undefined,
      dueDate: form.dueDate || undefined,
      priority: form.priority as Task['priority'],
      status: form.status as Task['status'],
      tags: form.tags ? form.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : undefined,
    };

    const { data, error: apiError } = await api.put<Task>(`/api/tasks/${task.id}`, payload);
    if (apiError || !data) {
      setError(apiError || 'Unable to update task.');
      setSaving(false);
      return;
    }

    setTask(data);
    toast('Task updated.', 'success');
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!task) return;
    setSaving(true);
    const { error: apiError } = await api.delete<{ success: true }>(`/api/tasks/${task.id}`);
    if (apiError) {
      setError(apiError);
      setSaving(false);
      return;
    }
    toast('Task deleted.', 'success');
    router.push('/tasks');
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error && !task) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-error">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!task) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-secondary">Task not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold">Task details</h1>
              <p className="text-sm text-secondary">Last updated {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'N/A'}</p>
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
        <CardContent>
          <form className="space-y-4" onSubmit={handleSave}>
            <Input label="Title" value={form.title} onChange={handleChange('title')} required />
            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                rows={4}
                value={form.description}
                onChange={handleChange('description')}
              />
            </div>
            <Input label="Due date" type="date" value={form.dueDate} onChange={handleChange('dueDate')} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full rounded-md border border-border px-3 py-2 text-sm"
                  value={form.status}
                  onChange={handleChange('status')}
                >
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Priority</label>
                <select
                  className="w-full rounded-md border border-border px-3 py-2 text-sm"
                  value={form.priority}
                  onChange={handleChange('priority')}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <Input label="Tags" value={form.tags} onChange={handleChange('tags')} />
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
              <Button variant="outline" type="button" onClick={() => router.push('/tasks')}>
                Back to tasks
              </Button>
              <Button variant="destructive" type="button" onClick={handleDelete}>
                Delete task
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
