'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';

interface TaskResponse {
  id: string;
}

export default function NewTaskPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      title: form.title,
      description: form.description || undefined,
      dueDate: form.dueDate || undefined,
      priority: form.priority,
      tags: form.tags ? form.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : undefined,
    };

    const { data, error: apiError } = await api.post<TaskResponse>('/api/tasks', payload);

    if (apiError || !data) {
      setError(apiError || 'Unable to create task.');
      setLoading(false);
      return;
    }

    toast('Task created successfully.', 'success');
    router.push(`/tasks/${data.id}`);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Create new task</h1>
          <p className="text-sm text-secondary">Add details to keep your workflow organized.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange('title')}
              required
            />
            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                rows={4}
                value={form.description}
                onChange={handleChange('description')}
              />
            </div>
            <Input
              label="Due date"
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange('dueDate')}
            />
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
            <Input
              label="Tags"
              value={form.tags}
              onChange={handleChange('tags')}
              placeholder="work, personal"
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex items-center gap-3">
              <Button type="submit" loading={loading}>
                Create task
              </Button>
              <Button variant="outline" type="button" onClick={() => router.push('/tasks')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
