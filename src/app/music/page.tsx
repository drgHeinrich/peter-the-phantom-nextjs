import { getReleases } from '@/lib/data';
import { MusicClient } from '@/components/MusicClient';

export const metadata = {
  title: 'Music — Peter the Phantom',
  description: 'Every album and single from Peter the Phantom.',
};

export default async function MusicPage() {
  const releases = await getReleases();
  return <MusicClient releases={releases} />;
}
