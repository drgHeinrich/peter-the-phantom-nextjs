'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SecretGateModalProps {
  isOpen: boolean;
  onUnlock: (email: string) => void;
  onClose: () => void;
}

export function SecretGateModal({ isOpen, onUnlock, onClose }: SecretGateModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  function validate(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate(email)) { setError('Please enter a valid email address.'); return; }
    setError('');
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error: fnError } = await supabase.functions.invoke('submit-secret-gate', {
        body: { email: email.trim().toLowerCase() },
      });
      if (fnError) throw fnError;
      onUnlock(email.trim().toLowerCase());
    } catch (err) {
      console.error('[secret-gate] submission error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 12 }}
            transition={{ duration: 0.25, ease: 'easeOut' as const }}
            className="relative w-full max-w-md bg-[var(--color-bg)] border border-[var(--color-border)] p-10"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-200"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-5">
                <Lock className="w-8 h-8 text-[var(--color-text-muted)]" />
                <Sparkles className="w-4 h-4 text-[var(--color-accent)] absolute -top-1 -right-2" />
              </div>
              <span className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] font-medium mb-3 block">
                Secret Goodies
              </span>
              <h2 className="font-serif text-2xl md:text-3xl mb-3">Unlock the Vault</h2>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-xs">
                Unreleased tracks, acoustic sessions &amp; raw material — exclusively
                for the inner circle. Drop your email to get in.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-4">
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] text-sm tracking-wide focus:outline-none focus:border-[var(--color-accent)] transition-colors duration-200"
                  aria-label="Email address"
                  autoComplete="email"
                />
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-2 text-xs text-red-400 tracking-wide"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 text-sm font-medium tracking-widest uppercase transition-all duration-300 bg-[var(--color-accent)] text-[var(--color-bg)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Unlocking…' : 'Get Access'}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-[var(--color-text-muted)] leading-relaxed">
              No spam. Unsubscribe any time. Your email is only used to keep
              you in the loop on new releases &amp; exclusive content.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
