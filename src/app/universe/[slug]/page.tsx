import { notFound } from 'next/navigation';
import { getShow, getReleaseById } from '@/lib/data';
import { UniverseDetailClient } from '@/components/UniverseDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ checkout_success?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = await getShow(slug);
  if (!project) return {};
  const description = (project.subtitle || project.description).slice(0, 160);
  return {
    title: project.title,
    description,
    openGraph: {
      type: 'website',
      title: project.title,
      description,
      images: [{ url: project.image }],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description,
      images: [project.image],
    },
  };
}

export default async function UniverseDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { checkout_success } = await searchParams;

  const project = await getShow(slug);
  if (!project) notFound();

  const album = project.albumId ? await getReleaseById(project.albumId) : null;

  return (
    <UniverseDetailClient
      project={project}
      album={album}
      checkoutSuccess={checkout_success === 'true'}
    />
  );
}
