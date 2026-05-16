import { createClient } from '@/lib/supabase/server';
import { getShows, getReleases } from '@/lib/data';
import { Hero } from '@/components/Hero';
import { FeaturedUniverse } from '@/components/FeaturedUniverse';
import { FeaturedMusic } from '@/components/FeaturedMusic';
import { FeaturedVideo } from '@/components/FeaturedVideo';
import { Footer } from '@/components/Footer';
import { LandingPage } from '@/components/LandingPage';
import { HomepageGate } from '@/components/HomepageGate';
import type { LandingSection } from '@/types/landing';

export const dynamic = 'force-dynamic';

async function getHomeConfig() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_config')
    .select('key, value')
    .in('key', ['homepage_mode', 'landing_page_sections', 'homepage_redirect_url']);
  if (!data) return { mode: 'regular' as const, sections: [] as LandingSection[], redirectUrl: '' };
  const mode = (data.find(r => r.key === 'homepage_mode')?.value ?? 'regular') as 'regular' | 'landing' | 'redirect';
  const raw  = data.find(r => r.key === 'landing_page_sections')?.value ?? '[]';
  const redirectUrl = data.find(r => r.key === 'homepage_redirect_url')?.value ?? '';
  let sections: LandingSection[] = [];
  try { sections = JSON.parse(raw); } catch { sections = []; }
  return { mode, sections, redirectUrl };
}

export default async function HomePage() {
  const { mode, sections, redirectUrl } = await getHomeConfig();

  if (mode === 'landing') {
    const shows = await getShows();
    return <LandingPage sections={sections} shows={shows} />;
  }

  if (mode === 'redirect' && redirectUrl) {
    const [shows, releases] = await Promise.all([getShows(), getReleases()]);
    return <HomepageGate redirectUrl={redirectUrl} shows={shows} releases={releases} />;
  }

  const [shows, releases] = await Promise.all([getShows(), getReleases()]);
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
