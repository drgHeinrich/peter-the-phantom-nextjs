import type { Metadata } from 'next';
import { Playfair_Display, Inter, Permanent_Marker, Megrim, Caveat } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
});

const permanentMarker = Permanent_Marker({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-permanent-marker',
});

const megrim = Megrim({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-megrim',
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-caveat',
});

export const metadata: Metadata = {
  title: 'Peter the Phantom',
  description: 'Generative live performance, music and universe of Peter the Phantom.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${permanentMarker.variable} ${megrim.variable} ${caveat.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
