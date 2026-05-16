export interface GalleryItem {
  type: 'image' | 'video';
  src: string;
}

export interface TicketConfig {
  slug: string;
  priceInCents: number;
  currency: 'eur' | 'usd' | 'ron';
  accessDays: number;
  stripeProductIdTest?: string;
  stripeProductIdLive?: string;
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  story: string;
  image: string;
  heroImage: string;
  price: string;
  trailerUrl: string;
  trailerCaption: string;
  gallery: GalleryItem[];
  albumId?: number;
  hasPremiumContent?: boolean;
  contentComingSoon?: boolean;
  notifyTrack?: string;
  muxPlaybackId?: string;
  ticket?: TicketConfig;
  featured: boolean;
}
