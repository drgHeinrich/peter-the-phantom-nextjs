import type { MetadataRoute } from 'next';
import { getReleases, getShows } from '@/lib/data';

const BASE_URL = 'https://peterthephantom.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [releases, shows] = await Promise.all([getReleases(), getShows()]);

  const releaseEntries: MetadataRoute.Sitemap = releases.map((r) => ({
    url: `${BASE_URL}/music/${r.slug}`,
    changeFrequency: 'yearly',
    priority: 0.7,
  }));

  const showEntries: MetadataRoute.Sitemap = shows.map((s) => ({
    url: `${BASE_URL}/universe/${s.slug}`,
    changeFrequency: 'yearly',
    priority: 0.7,
  }));

  return [
    { url: `${BASE_URL}/`,         changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/music`,    changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/universe`, changeFrequency: 'monthly', priority: 0.8 },
    ...releaseEntries,
    ...showEntries,
  ];
}
