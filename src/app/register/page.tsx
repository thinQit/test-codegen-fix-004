'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';

interface RegisterResponse {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({ email: '', password: '', displayName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: apiError } = await api.post<RegisterResponse>('/api/auth/register', {
      email: form.email,
      password: form.password,
      displayName: form.displayName || undefined,
    });

    if (apiError || !data) {
      setError(apiError || 'Registration failed.');
      setLoading(false);
      return;
    }

    toast('Account created. Please log in.', 'success');
    router.push('/login');
    setLoading(false);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-xl font-semibold">Create account</h1>
          <p className="text-sm text-secondary">Start managing your tasks today</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Display name"
              name="displayName"
              value={form.displayName}
              onChange={handleChange('displayName')}
              placeholder="Jane Doe"
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange('email')}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange('password')}
              required
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" fullWidth loading={loading}>
              Sign Up
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-secondary">
            Already have an account?{' '}
            <Link className="text-primary hover:underline" href="/login">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
