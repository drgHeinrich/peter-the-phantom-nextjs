'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from './ui/Card';
import type { Release } from '@/types/release';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' as const } },
};

export function FeaturedMusic({ releases }: { releases: Release[] }) {
  const router = useRouter();
  const featured = releases.filter((r) => r.featured);

  return (
    <section className="px-6 py-32 md:py-40 bg-[var(--color-bg-alt)] border-y border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={containerVariants}>
          <motion.div variants={itemVariants} className="mb-16">
            <span className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] font-medium mb-4 block">Discography</span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[var(--color-text)] tracking-tight">Featured Music</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 mb-12">
            {featured.map((album) => (
              <motion.div key={album.id} variants={itemVariants}>
                <Card
                  image={album.cover}
                  imageAlt={`Album cover for ${album.title}`}
                  title={album.title}
                  subtitle={album.year}
                  onClick={() => router.push(`/music/${album.slug}`)}
                />
              </motion.div>
            ))}
          </div>

          <motion.div variants={itemVariants}>
            <button onClick={() => router.push('/music')} className="inline-flex items-center gap-3 text-sm tracking-wider uppercase text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors duration-300 group">
              View All Music
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
