'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { createClient } from '@/lib/supabase/client';
import { LegalModal, type LegalDoc } from './LegalModal';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

const socialLinks = [
  { name: 'Instagram', icon: InstagramIcon, href: 'https://www.instagram.com/peterthephantom' },
  { name: 'YouTube',   icon: YouTubeIcon,   href: 'https://www.youtube.com/@peterthephantom' },
];

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export function Footer() {
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [legalDoc, setLegalDoc] = useState<LegalDoc | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const supabase = createClient();
      const { error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: { email: email.toLowerCase().trim() },
      });
      if (error) throw error;
      setStatus('success');
      setEmail('');
    } catch (err) {
      console.error('[newsletter] subscription error:', err);
      setStatus('error');
    }
  };

  return (
    <footer className="px-6 py-32 md:py-40 border-t border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-32">
          <motion.div variants={itemVariants}>
            <span className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] font-medium mb-6 block">Newsletter</span>
            <h3 className="font-serif text-3xl text-[var(--color-text)] mb-6">Stay Updated</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-8 leading-relaxed">Subscribe for new releases, tour dates, and exclusive content.</p>

            {status === 'success' ? (
              <p className="text-sm text-[var(--color-accent)]">Thank you for subscribing.</p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label htmlFor="email-input" className="sr-only">Email address</label>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                  placeholder="Enter your email"
                  required
                  disabled={status === 'loading'}
                  className="px-4 py-4 text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors duration-300 disabled:opacity-50"
                />
                <Button type="submit" variant="primary" disabled={status === 'loading'} className="w-full sm:w-auto">
                  {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
                </Button>
                {status === 'error' && <p className="text-xs text-red-400">Something went wrong. Please try again.</p>}
              </form>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="md:text-right">
            <span className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] font-medium mb-6 block">Connect</span>
            <h3 className="font-serif text-3xl text-[var(--color-text)] mb-8">Follow</h3>
            <nav aria-label="Social media links">
              <ul className="flex gap-8 md:justify-end">
                {socialLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} aria-label={link.name} className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors duration-300">
                      <link.icon className="w-6 h-6" />
                    </a>
                  </li>
                ))}
                <li>
                  <a href="https://open.spotify.com/artist/59XKURfha58aapFNL5Y34u?si=92vtXG3gRQ6DOiKh9js8Yw" aria-label="Spotify" className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors duration-300">
                    <SpotifyIcon className="w-6 h-6" />
                  </a>
                </li>
              </ul>
            </nav>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.6 }} className="mt-32 pt-12 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs tracking-wider uppercase text-[var(--color-text-muted)]">© 2026 Peter the Phantom. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => setLegalDoc('terms')} className="text-xs tracking-wider uppercase text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors duration-200">Terms &amp; Conditions</button>
            <button onClick={() => setLegalDoc('privacy')} className="text-xs tracking-wider uppercase text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors duration-200">Privacy Policy</button>
          </div>
        </motion.div>
      </div>

      <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />
    </footer>
  );
}
