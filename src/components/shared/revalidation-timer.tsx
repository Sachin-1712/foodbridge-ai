'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function RevalidationTimer({ intervalMs = 10000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Demo Sync: Revalidating page data...');
      router.refresh();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [router, intervalMs]);

  return null;
}
