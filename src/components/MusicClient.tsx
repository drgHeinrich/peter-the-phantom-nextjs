'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Card } from './ui/Card';
import { Footer } from './Footer';
import type { Release } from '@/types/release';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export function MusicClient({ releases }: { releases: Release[] }) {
  const router = useRouter();
  const albums  = releases.filter(r => r.type === 'Album');
  const singles = releases.filter(r => r.type === 'Single');

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex items-center bg-gradient-to-b from-[var(--color-bg)] to-transparent">
        <button
          onClick={() => router.push('/')}
          className="group flex items-center gap-2 text-sm uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </button>
      </nav>

      <section className="pt-32 pb-16 md:pt-44 md:pb-24 px-6 border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] font-medium mb-4 block">
              Discography
            </span>
            <h1 className="font-serif text-5xl md:text-7xl tracking-tight mb-6">All Releases</h1>
            <p className="text-lg text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
              Every album and single from Peter the Phantom — a growing archive
              of stories told in sound.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Albums */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={containerVariants}>
            <motion.div variants={itemVariants} className="mb-12">
              <span className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] font-medium mb-4 block">Full-Length</span>
              <h2 className="font-serif text-3xl md:text-4xl">Albums</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
              {albums.map(album => (
                <motion.div key={album.id} variants={itemVariants}>
                  <Card
                    image={album.cover}
                    imageAlt={`Cover art for ${album.title}`}
                    title={album.title}
                    subtitle={`${album.type} • ${album.year}`}
                    description={album.description}
                    onClick={() => router.push(`/music/${album.slug}?from=music`)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Singles */}
      <section className="py-20 md:py-28 px-6 bg-[var(--color-bg-alt)] border-y border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={containerVariants}>
            <motion.div variants={itemVariants} className="mb-12">
              <span className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] font-medium mb-4 block">Standalone</span>
              <h2 className="font-serif text-3xl md:text-4xl">Singles</h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
              {singles.map(single => (
                <motion.div key={single.id} variants={itemVariants}>
                  <Card
                    image={single.cover}
                    imageAlt={`Cover art for ${single.title}`}
                    title={single.title}
                    subtitle={`${single.type} • ${single.year}`}
                    onClick={() => router.push(`/music/${single.slug}?from=music`)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
