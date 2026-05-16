import { notFound } from 'next/navigation';
import { getRelease } from '@/lib/data';
import { ReleaseDetailClient } from '@/components/ReleaseDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const release = await getRelease(slug);
  if (!release) return {};
  return {
    title: `${release.title} — Peter the Phantom`,
    description: release.description,
  };
}

export default async function ReleaseDetailPage({ params }: Props) {
  const { slug } = await params;
  const release = await getRelease(slug);
  if (!release) notFound();

  return <ReleaseDetailClient release={release} />;
}
