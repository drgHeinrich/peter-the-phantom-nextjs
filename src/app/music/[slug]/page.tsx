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
  const description = `${release.title} by ${release.artist} (${release.year}). ${release.description}`.slice(0, 160);
  return {
    title: release.title,
    description,
    openGraph: {
      type: 'music.album',
      title: release.title,
      description,
      images: [{ url: release.cover }],
    },
    twitter: {
      card: 'summary_large_image',
      title: release.title,
      description,
      images: [release.cover],
    },
  };
}

export default async function ReleaseDetailPage({ params }: Props) {
  const { slug } = await params;
  const release = await getRelease(slug);
  if (!release) notFound();

  return <ReleaseDetailClient release={release} />;
}
