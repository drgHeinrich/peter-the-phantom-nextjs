'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { createClient } from '@/lib/supabase/client';

interface NotifyMeSectionProps {
  track: string;
  heading: string;
  subheading: string;
}

export function NotifyMeSection({ track, heading, subheading }: NotifyMeSectionProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const supabase = createClient();
      const { error } = await supabase.functions.invoke('submit-early-access', {
        body: { email: trimmed, favouriteTrack: track },
      });
      if (error) throw error;
      setStatus('success');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-8"
      >
        <p className="text-[var(--color-accent)] text-sm tracking-[0.2em] uppercase font-medium mb-2">
          You&apos;re on the list
        </p>
        <p className="text-[var(--color-text-muted)] text-base">
          We&apos;ll reach out as soon as it&apos;s available.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="text-center">
      {subheading && (
        <p className="text-[var(--color-text-muted)] mb-8 text-base leading-relaxed">{subheading}</p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full sm:flex-1 px-4 py-3 bg-transparent border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors duration-200 text-sm tracking-wide"
        />
        <Button type="submit" variant="primary" disabled={status === 'loading'} className="w-full sm:w-auto whitespace-nowrap">
          {status === 'loading' ? 'Sending…' : heading}
        </Button>
      </form>
      {status === 'error' && <p className="mt-3 text-sm text-red-400">{errorMsg}</p>}
    </div>
  );
}
