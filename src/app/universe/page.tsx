import { getShows } from '@/lib/data';
import { UniverseClient } from '@/components/UniverseClient';

export const metadata = {
  title: 'Universe — Peter the Phantom',
  description: 'Explore all creative projects and immersive performances.',
};

export default async function UniversePage() {
  const projects = await getShows();
  return <UniverseClient projects={projects} />;
}
