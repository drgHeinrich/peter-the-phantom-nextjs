export interface Video {
  id: string;
  title: string;
}

export interface Release {
  id: number;
  slug: string;
  type: 'Album' | 'Single';
  title: string;
  year: string;
  artist: string;
  cover: string;
  spotifyEmbedUrl?: string;
  bandcampEmbedUrl?: string;
  soundcloudEmbedUrl?: string;
  secretLabel?: string;
  defaultPlatform?: 'spotify' | 'bandcamp';
  description: string;
  videos: Video[];
  featured: boolean;
}
