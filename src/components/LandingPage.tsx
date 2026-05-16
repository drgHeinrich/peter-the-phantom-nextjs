import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/Footer';
import type { LandingSection } from '@/types/landing';
import type { Project } from '@/types/project';

interface Props {
  sections: LandingSection[];
  shows: Project[];
}

export function LandingPage({ sections, shows }: Props) {
  const showsBySlug = Object.fromEntries(shows.map(s => [s.slug, s]));

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {sections.map(section => {
        switch (section.type) {

          case 'hero':
            return (
              <section key={section.id} className="relative h-screen flex items-center justify-center overflow-hidden">
                {section.backgroundImage && (
                  <>
                    <Image
                      src={section.backgroundImage}
                      alt=""
                      fill
                      className="object-cover"
                      priority
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/55" />
                  </>
                )}
                <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
                  {section.title && (
                    <h1 className="font-serif text-5xl md:text-7xl text-white mb-5 leading-tight">
                      {section.title}
                    </h1>
                  )}
                  {section.subtitle && (
                    <p className="text-base md:text-lg text-white/70 mb-10 leading-relaxed">
                      {section.subtitle}
                    </p>
                  )}
                  {section.ctaText && section.ctaLink && (
                    <Link
                      href={section.ctaLink}
                      className="inline-block px-8 py-3 bg-[var(--color-accent)] text-[var(--color-bg)] text-xs tracking-widest uppercase font-medium hover:opacity-90 transition-opacity"
                    >
                      {section.ctaText}
                    </Link>
                  )}
                </div>
              </section>
            );

          case 'show_card': {
            const show = showsBySlug[section.showSlug];
            if (!show) return null;
            return (
              <section key={section.id} className="py-20 px-6">
                <Link
                  href={`/universe/${show.slug}?from=home`}
                  className="block max-w-2xl mx-auto group"
                >
                  {show.image && (
                    <div className="relative aspect-video overflow-hidden mb-5">
                      <Image
                        src={show.image}
                        alt={show.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    </div>
                  )}
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-accent)] mb-2">Show</p>
                  <h2 className="font-serif text-3xl mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                    {show.title}
                  </h2>
                  {show.subtitle && (
                    <p className="text-sm text-[var(--color-text-muted)]">{show.subtitle}</p>
                  )}
                </Link>
              </section>
            );
          }

          case 'ticket_cta': {
            const show = showsBySlug[section.showSlug];
            if (!show) return null;
            return (
              <section key={section.id} className="py-20 px-6 text-center bg-[#111]">
                <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-accent)] mb-4">
                  {show.title}
                </p>
                <h2 className="font-serif text-4xl md:text-5xl mb-8">{section.heading}</h2>
                {show.price && (
                  <p className="text-[var(--color-text-muted)] text-sm mb-8">{show.price}</p>
                )}
                <Link
                  href={`/universe/${show.slug}`}
                  className="inline-block px-10 py-4 bg-[var(--color-accent)] text-[var(--color-bg)] text-xs tracking-widest uppercase font-medium hover:opacity-90 transition-opacity"
                >
                  Get Tickets
                </Link>
              </section>
            );
          }

          case 'youtube':
            return (
              <section key={section.id} className="py-16 px-6">
                <div className="max-w-4xl mx-auto">
                  <div className="relative aspect-video bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${section.videoId}`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={section.caption ?? 'Video'}
                    />
                  </div>
                  {section.caption && (
                    <p className="text-center text-sm text-[var(--color-text-muted)] mt-4">
                      {section.caption}
                    </p>
                  )}
                </div>
              </section>
            );

          case 'text':
            return (
              <section key={section.id} className="py-16 px-6 max-w-2xl mx-auto text-center">
                {section.heading && (
                  <h2 className="font-serif text-3xl md:text-4xl mb-6">{section.heading}</h2>
                )}
                {section.body && (
                  <p className="text-[var(--color-text-muted)] leading-relaxed text-base">
                    {section.body}
                  </p>
                )}
              </section>
            );

          case 'image':
            return (
              <section key={section.id} className="py-12 px-6 max-w-3xl mx-auto">
                {section.url && (
                  <Image
                    src={section.url}
                    alt={section.caption ?? ''}
                    width={1200}
                    height={800}
                    className="w-full h-auto"
                    unoptimized
                  />
                )}
                {section.caption && (
                  <p className="text-center text-sm text-[var(--color-text-muted)] mt-4">
                    {section.caption}
                  </p>
                )}
              </section>
            );

          default:
            return null;
        }
      })}
      <Footer />
    </main>
  );
}
