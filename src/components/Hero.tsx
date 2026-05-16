'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';

export function Hero() {
  const router = useRouter();
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-bg)]/40 to-[var(--color-bg)] z-10" />
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, ease: 'easeOut' as const }}
          src="/images/HeroSectionPic.jpg"
          alt="Peter the Phantom"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="relative z-20 max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: 'easeOut' as const, delay: 0.3 }} className="mb-6">
          <span className="inline-block text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] font-medium mb-4">Performing Artist</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' as const, delay: 0.5 }}
          className="flex flex-col md:flex-row md:items-baseline justify-center gap-2 md:gap-3 text-5xl md:text-7xl lg:text-8xl text-[var(--color-text)] mb-8 leading-tight"
        >
          <span className="font-['Megrim'] tracking-wider">Peter</span>
          <span className="font-['P22_Hopper_Edward','Caveat'] tracking-normal text-6xl md:text-8xl lg:text-9xl">the</span>
          <span className="font-['Megrim'] tracking-wider">Phantom</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: 'easeOut' as const, delay: 0.7 }} className="text-lg md:text-xl text-[var(--color-text-muted)] mb-12 max-w-2xl mx-auto leading-relaxed">
          Stories in sound
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: 'easeOut' as const, delay: 0.9 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="primary" onClick={() => router.push('/universe')}>Explore Universe</Button>
          <Button variant="ghost" onClick={() => router.push('/music')}>Listen Now</Button>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--color-bg)] to-transparent z-10" />
    </section>
  );
}
