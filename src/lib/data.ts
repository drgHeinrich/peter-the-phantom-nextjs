import { unstable_cache } from 'next/cache';
import { createClient } from './supabase/server';
import type { Project } from '@/types/project';
import type { Release } from '@/types/release';

function rowToProject(row: Record<string, unknown>): Project {
  const tc = row.ticket_config as Record<string, unknown> | null;
  return {
    id:                row.id as number,
    slug:              row.slug as string,
    title:             row.title as string,
    subtitle:          row.subtitle as string,
    description:       row.description as string,
    story:             row.story as string,
    image:             row.image as string,
    heroImage:         row.hero_image as string,
    price:             row.price as string,
    trailerUrl:        row.trailer_url as string,
    trailerCaption:    row.trailer_caption as string,
    gallery:           (row.gallery as Project['gallery']) ?? [],
    albumId:           (row.album_id as number) ?? undefined,
    hasPremiumContent: row.has_premium_content as boolean,
    contentComingSoon: row.content_coming_soon as boolean,
    notifyTrack:       (row.notify_track as string) || undefined,
    muxPlaybackId:     (row.mux_playback_id as string) || undefined,
    ticket: tc ? {
      slug:                row.slug as string,
      priceInCents:        tc.price_in_cents as number,
      currency:            tc.currency as 'eur' | 'usd' | 'ron',
      accessDays:          tc.access_days as number,
      stripeProductIdTest: (tc.stripe_product_id_test as string) || undefined,
      stripeProductIdLive: (tc.stripe_product_id_live as string) || undefined,
    } : undefined,
    featured: row.featured as boolean,
  };
}

function rowToRelease(row: Record<string, unknown>): Release {
  return {
    id:               row.id as number,
    slug:             row.slug as string,
    type:             row.type as 'Album' | 'Single',
    title:            row.title as string,
    year:             row.year as string,
    artist:           row.artist as string,
    cover:            row.cover as string,
    spotifyEmbedUrl:  (row.spotify_embed_url as string) || undefined,
    bandcampEmbedUrl: (row.bandcamp_embed_url as string) || undefined,
    soundcloudEmbedUrl: (row.soundcloud_embed_url as string) || undefined,
    secretLabel:      (row.secret_label as string) || undefined,
    defaultPlatform:  (row.default_platform as 'spotify' | 'bandcamp') || undefined,
    description:      row.description as string,
    videos:           (row.videos as Release['videos']) ?? [],
    featured:         row.featured as boolean,
  };
}

async function fetchShows(): Promise<Project[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('shows').select('*').order('sort_order', { ascending: true });
  return (data ?? []).map(rowToProject);
}

async function fetchShow(slug: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('shows').select('*').eq('slug', slug).single();
  return data ? rowToProject(data as Record<string, unknown>) : null;
}

async function fetchReleases(): Promise<Release[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('releases').select('*').order('sort_order', { ascending: true });
  return (data ?? []).map(rowToRelease);
}

async function fetchRelease(slug: string): Promise<Release | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('releases').select('*').eq('slug', slug).single();
  return data ? rowToRelease(data as Record<string, unknown>) : null;
}

async function fetchReleaseById(id: number): Promise<Release | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('releases').select('*').eq('id', id).single();
  return data ? rowToRelease(data as Record<string, unknown>) : null;
}

const REVALIDATE = 60; // seconds

export const getShows     = unstable_cache(fetchShows,                     ['shows'],          { revalidate: REVALIDATE });
export const getShow      = unstable_cache(fetchShow,                      ['show'],           { revalidate: REVALIDATE });
export const getReleases  = unstable_cache(fetchReleases,                  ['releases'],       { revalidate: REVALIDATE });
export const getRelease   = unstable_cache(fetchRelease,                   ['release'],        { revalidate: REVALIDATE });
export const getReleaseById = unstable_cache(fetchReleaseById,             ['release-by-id'],  { revalidate: REVALIDATE });
