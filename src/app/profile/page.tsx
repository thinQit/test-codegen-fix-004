'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';

interface ProfileResponse {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error: apiError } = await api.get<ProfileResponse>('/api/auth/me');
      if (apiError || !data) {
        setError(apiError || 'Unable to load profile.');
        setProfile(null);
      } else {
        setProfile(data);
        setDisplayName(data.displayName || '');
        setError(null);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    const { data, error: apiError } = await api.put<ProfileResponse>(`/api/users/${profile.id}`, {
      displayName,
    });
    if (apiError || !data) {
      setError(apiError || 'Unable to update profile.');
      setSaving(false);
      return;
    }
    setProfile(data);
    setUser(
      user
        ? { ...user, name: data.displayName || user.name, email: data.email, updatedAt: new Date().toISOString() }
        : null
    );
    toast('Profile updated.', 'success');
    setSaving(false);
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    const { error: apiError } = await api.put<{ success: boolean }>(`/api/users/${profile.id}`, {
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    });
    if (apiError) {
      setError(apiError || 'Unable to change password.');
      setSaving(false);
      return;
    }
    toast('Password updated.', 'success');
    setPasswords({ currentPassword: '', newPassword: '' });
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-error">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-secondary">No profile data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Profile</h1>
          <p className="text-sm text-secondary">Manage your account details.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleUpdateProfile}>
            <Input label="Email" value={profile.email} readOnly />
            <Input
              label="Display name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" loading={saving}>
              Update profile
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Change password</h2>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleChangePassword}>
            <Input
              label="Current password"
              type="password"
              value={passwords.currentPassword}
              onChange={(event) => setPasswords((prev) => ({ ...prev, currentPassword: event.target.value }))}
              required
            />
            <Input
              label="New password"
              type="password"
              value={passwords.newPassword}
              onChange={(event) => setPasswords((prev) => ({ ...prev, newPassword: event.target.value }))}
              required
            />
            <Button type="submit" variant="outline" loading={saving}>
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
