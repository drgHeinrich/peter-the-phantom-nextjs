'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hero } from '@/components/Hero';
import { FeaturedUniverse } from '@/components/FeaturedUniverse';
import { FeaturedMusic } from '@/components/FeaturedMusic';
import { FeaturedVideo } from '@/components/FeaturedVideo';
import { Footer } from '@/components/Footer';
import type { Project } from '@/types/project';
import type { Release } from '@/types/release';

const SESSION_KEY = 'ptp_home_visited';

interface Props {
  redirectUrl: string;
  shows: Project[];
  releases: Release[];
}

export function HomepageGate({ redirectUrl, shows, releases }: Props) {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(SESSION_KEY, '1');
      router.replace(redirectUrl);
    } else {
      setReady(true);
    }
  }, [router, redirectUrl]);

  if (!ready) return <div className="min-h-screen bg-[var(--color-bg)]" />;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <Hero />
      <FeaturedUniverse projects={shows} />
      <FeaturedMusic releases={releases} />
      <FeaturedVideo />
      <Footer />
    </main>
  );
}
