export interface HeroSection {
  id: string; type: 'hero';
  title: string; subtitle: string;
  backgroundImage: string; ctaText: string; ctaLink: string;
}
export interface ShowCardSection  { id: string; type: 'show_card';  showSlug: string; }
export interface TicketCtaSection { id: string; type: 'ticket_cta'; showSlug: string; heading: string; }
export interface YoutubeSection   { id: string; type: 'youtube';    videoId: string;  caption?: string; }
export interface TextSection      { id: string; type: 'text';       heading: string;  body: string; }
export interface ImageSection     { id: string; type: 'image';      url: string;      caption?: string; }

export type LandingSection =
  | HeroSection | ShowCardSection | TicketCtaSection
  | YoutubeSection | TextSection | ImageSection;
