'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Card } from './ui/Card';
import { Footer } from './Footer';
import type { Project } from '@/types/project';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export function UniverseClient({ projects }: { projects: Project[] }) {
  const router = useRouter();

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
              Creative Universe
            </span>
            <h1 className="font-serif text-5xl md:text-7xl tracking-tight mb-6">All Projects</h1>
            <p className="text-lg text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
              Explore the intersection of sound, light, and code. A collection
              of immersive installations and generative performances.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16"
          >
            {projects.map((project) => (
              <motion.div key={project.id} variants={itemVariants}>
                <Card
                  image={project.image}
                  imageAlt={`Cover art for ${project.title}`}
                  title={project.title}
                  subtitle={project.subtitle}
                  description={project.description}
                  onClick={() => router.push(`/universe/${project.slug}?from=universe`)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
