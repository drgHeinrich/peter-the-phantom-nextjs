import { getShows, getReleases } from '@/lib/data';
import { Hero } from '@/components/Hero';
import { FeaturedUniverse } from '@/components/FeaturedUniverse';
import { FeaturedMusic } from '@/components/FeaturedMusic';
import { FeaturedVideo } from '@/components/FeaturedVideo';
import { Footer } from '@/components/Footer';

export default async function HomePage() {
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
