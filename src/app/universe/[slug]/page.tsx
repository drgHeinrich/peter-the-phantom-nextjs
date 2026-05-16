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
  return {
    title: `${project.title} — Peter the Phantom`,
    description: project.description,
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
