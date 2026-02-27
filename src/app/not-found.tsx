import Link from 'next/link';
import Button from '@/components/ui/Button';

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-semibold">404 - Page not found</h1>
      <p className="text-sm text-secondary">The page you are looking for doesn’t exist.</p>
      <Link href="/" aria-label="Go to home">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}

export default NotFound;
