'use client';

import { useToast } from '@/providers/ToastProvider';

export function Toaster() {
  const { toasts } = useToast();
  if (toasts.length === 0) return null;
  return null;
}

export default Toaster;
