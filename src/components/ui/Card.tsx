'use client';
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  image?: string;
  imageAlt?: string;
  title: string;
  subtitle?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ image, imageAlt = '', title, subtitle, description, children, className = '', onClick }: CardProps) {
  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: 'easeOut' as const }}
      className={`group cursor-pointer ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } }}
    >
      {image && (
        <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-alt)] mb-6 border border-[var(--color-border)]">
          <motion.img
            src={image}
            alt={imageAlt}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: 'easeOut' as const }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
        </div>
      )}
      <div className="space-y-2">
        <h3 className="font-serif text-xl text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors duration-300">{title}</h3>
        {subtitle && <p className="text-xs tracking-wider uppercase text-[var(--color-text-muted)]">{subtitle}</p>}
        {description && <p className="text-sm text-[var(--color-text-muted)] leading-relaxed pt-2">{description}</p>}
        {children}
      </div>
    </motion.article>
  );
}
