'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';

interface NavItem {
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/tasks/new', label: 'Create Task' },
  { href: '/profile', label: 'Profile' }
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();

  const toggleMenu = () => setOpen(prev => !prev);

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold" aria-label="Go to dashboard">
          Task Manager
        </Link>
        <button
          className="md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={toggleMenu}
        >
          <span className="block h-0.5 w-6 bg-foreground"></span>
          <span className="mt-1 block h-0.5 w-6 bg-foreground"></span>
          <span className="mt-1 block h-0.5 w-6 bg-foreground"></span>
        </button>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary navigation">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === item.href ? 'text-primary' : 'text-secondary'
              )}
            >
              {item.label}
            </Link>
          ))}
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-secondary">{user?.name || user?.email}</span>
              <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
            </div>
          )}
        </nav>
      </div>
      {open && (
        <nav className="border-t border-border bg-background px-4 py-4 md:hidden" aria-label="Mobile navigation">
          <div className="flex flex-col gap-3">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href ? 'text-primary' : 'text-secondary'
                )}
              >
                {item.label}
              </Link>
            ))}
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">{user?.name || user?.email}</span>
                <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

export default Navigation;
