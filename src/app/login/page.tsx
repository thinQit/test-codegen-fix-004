'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { User } from '@/types';

interface LoginResponse {
  token: string;
  expiresIn: number;
  user: { id: string; email: string; displayName?: string };
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: apiError } = await api.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    });

    if (apiError || !data) {
      setError(apiError || 'Login failed.');
      setLoading(false);
      return;
    }

    localStorage.setItem('token', data.token);
    const user: User = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.displayName || data.user.email,
      role: 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    login(user);
    toast('Welcome back!', 'success');
    router.push('/');
    setLoading(false);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-xl font-semibold">Log in</h1>
          <p className="text-sm text-secondary">Access your task dashboard</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" fullWidth loading={loading}>
              Sign In
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-secondary">
            New here?{' '}
            <Link className="text-primary hover:underline" href="/register">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
