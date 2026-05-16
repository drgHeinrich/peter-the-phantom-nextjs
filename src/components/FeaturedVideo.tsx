'use client';
import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' as const } },
};

export function FeaturedVideo() {
  return (
    <section className="px-6 py-32 md:py-40 border-t border-[var(--color-border)]">
      <div className="max-w-5xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={containerVariants}>
          <motion.div variants={itemVariants} className="mb-16 text-center">
            <span className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] font-medium mb-4 block">Visual Experience</span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[var(--color-text)] tracking-tight">Latest</h2>
          </motion.div>

          <motion.div variants={itemVariants} className="relative aspect-video bg-[var(--color-bg-alt)] overflow-hidden border border-[var(--color-border)]">
            <iframe
              src="https://www.youtube.com/embed/Y0MmpsjCTB4"
              title="Featured video"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>

          <motion.p variants={itemVariants} className="text-center text-sm tracking-wide text-[var(--color-text-muted)] mt-8">
            &quot;The End&quot; — Official Music Video
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
