'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SESSION_KEY = 'ptp_home_visited';

export function HomepageSessionRedirect({ url }: { url: string }) {
  const router = useRouter();
  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(SESSION_KEY, '1');
      router.replace(url);
    }
  }, [router, url]);
  return null;
}
