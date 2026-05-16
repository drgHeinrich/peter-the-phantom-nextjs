'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ticket, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { storeAccess } from '@/utils/ticketAccess';
import type { Project } from '@/types/project';
import { LegalModal, type LegalDoc } from './LegalModal';

interface TicketModalProps {
  isOpen: boolean;
  project: Project;
  onUnlock: () => void;
  onClose: () => void;
  initialEmail?: string;
}

type View = 'buy' | 'redeem-email' | 'redeem-code' | 'success';

function formatPrice(priceInCents: number, currency: string): string {
  const amount = priceInCents / 100;
  switch (currency) {
    case 'eur': return `€${amount.toFixed(2)}`;
    case 'usd': return `$${amount.toFixed(2)}`;
    case 'ron': return `${amount.toFixed(2)} RON`;
    default:    return `${amount.toFixed(2)}`;
  }
}

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 28 }),
  center: { opacity: 1, x: 0 },
  exit:  (dir: number) => ({ opacity: 0, x: dir * -28 }),
};

export function TicketModal({ isOpen, project, onUnlock, onClose, initialEmail }: TicketModalProps) {
  const [view, setView]             = useState<View>(initialEmail ? 'redeem-code' : 'buy');
  const [direction, setDirection]   = useState(1);
  const [email, setEmail]           = useState(initialEmail ?? '');
  const [otp, setOtp]               = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError]     = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [legalDoc, setLegalDoc] = useState<LegalDoc | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const otpRef   = useRef<HTMLInputElement>(null);

  const ticket     = project.ticket;
  const isFree     = !ticket || ticket.priceInCents === 0;
  const priceLabel = ticket && ticket.priceInCents > 0
    ? formatPrice(ticket.priceInCents, ticket.currency) : null;
  const accessDays = ticket?.accessDays ?? 30;
  const slug       = ticket?.slug ?? project.title.toLowerCase().replace(/\s+/g, '-');

  useEffect(() => {
    if (isOpen) {
      setView(initialEmail ? 'redeem-code' : 'buy');
      setDirection(1);
      setEmail(initialEmail ?? '');
      setOtp('');
      setEmailError(''); setOtpError('');
      setIsSubmitting(false);
      setTermsAccepted(false);
    }
  }, [isOpen, initialEmail]);

  useEffect(() => {
    if (!isOpen || view === 'success') return;
    const timer = setTimeout(() => {
      (view === 'redeem-code' ? otpRef : emailRef).current?.focus();
    }, 160);
    return () => clearTimeout(timer);
  }, [isOpen, view]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  function validateEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  function goTo(next: View, dir: number) {
    setDirection(dir);
    setView(next);
  }

  async function handleBuySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateEmail(email)) { setEmailError('Please enter a valid email address.'); return; }
    setEmailError('');
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: otpCheck } = await supabase.functions.invoke('request-otp', {
        body: { email: email.trim().toLowerCase(), projectSlug: slug },
      });
      if (otpCheck && otpCheck.error !== 'no_ticket') {
        goTo('redeem-code', 1);
        return;
      }

      const stripeMode = process.env.NEXT_PUBLIC_STRIPE_MODE ?? 'live';
      const stripeProductId = stripeMode === 'test'
        ? ticket?.stripeProductIdTest
        : ticket?.stripeProductIdLive;

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          email:           email.trim().toLowerCase(),
          projectSlug:     slug,
          priceInCents:    ticket?.priceInCents ?? 0,
          accessDays:      accessDays,
          successUrl:      `${window.location.origin}/universe/${slug}?checkout_success=true`,
          stripeProductId: stripeProductId,
        },
      });

      if (error) throw error;

      if (data.mode === 'stripe' && data.url) {
        localStorage.setItem('ptp_pending_checkout', JSON.stringify({ email: email.trim().toLowerCase(), slug }));
        window.location.href = data.url;
        return;
      }

      goTo('redeem-code', 1);
    } catch (err) {
      console.error('[buy] error:', err);
      setEmailError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRedeemEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateEmail(email)) { setEmailError('Please enter a valid email address.'); return; }
    setEmailError('');
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke('request-otp', {
        body: { email: email.trim().toLowerCase(), projectSlug: slug },
      });
      if (error) throw error;
      if (data?.error === 'no_ticket') {
        setEmailError('No active ticket found for this email. Buy access below.');
        return;
      }
      goTo('redeem-code', 1);
    } catch (err) {
      console.error('[request-otp] error:', err);
      setEmailError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRedeemCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) { setOtpError('Please enter your 6-digit code.'); return; }
    setOtpError('');
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: {
          email:         email.trim().toLowerCase(),
          projectSlug:   slug,
          otp:           otp.trim(),
          muxPlaybackId: project.muxPlaybackId,
        },
      });
      if (error) throw error;
      if (!data?.valid) {
        const messages: Record<string, string> = {
          invalid_otp:    'Incorrect code. Please check your email and try again.',
          otp_expired:    'This code has expired. Request a new one below.',
          access_expired: 'Your access period has ended. Purchase a new ticket to continue.',
          no_ticket:      'No ticket found. Please purchase access first.',
        };
        setOtpError(messages[data?.reason] ?? 'Verification failed. Please try again.');
        return;
      }
      storeAccess(slug, email.trim().toLowerCase(), data.accessExpiresAt, data.muxToken);
      goTo('success', 1);
      setTimeout(() => onUnlock(), 1600);
    } catch (err) {
      console.error('[verify-otp] error:', err);
      setOtpError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    'w-full px-4 py-3 bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] text-sm tracking-wide focus:outline-none focus:border-[var(--color-accent)] transition-colors duration-200';

  const submitBtnClass =
    'w-full py-3 text-sm font-medium tracking-widest uppercase transition-all duration-300 bg-[var(--color-accent)] text-[var(--color-bg)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed';

  const errorMsg = (msg: string) => (
    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="mt-2 text-xs text-red-400 tracking-wide">{msg}</motion.p>
  );

  return (
    <>
      <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />
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
              className="relative w-full max-w-md bg-[var(--color-bg)] border border-[var(--color-border)] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {view !== 'success' && (
                <button onClick={onClose}
                  className="absolute top-4 right-4 z-10 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-200"
                  aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              )}

              <AnimatePresence mode="wait" custom={direction}>

                {view === 'buy' && (
                  <motion.div key="buy" custom={direction} variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.22, ease: 'easeOut' as const }} className="p-10">
                    <div className="flex flex-col items-center text-center mb-8">
                      <Ticket className="w-8 h-8 text-[var(--color-accent)] mb-5" />
                      <span className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] font-medium mb-3 block">Premium Access</span>
                      <h2 className="font-serif text-2xl md:text-3xl mb-3">{project.title}</h2>
                      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                        {accessDays}-day access to the full performance recording.
                      </p>
                    </div>
                    <form onSubmit={handleBuySubmit} noValidate>
                      <div className="mb-3">
                        <label className="block text-xs tracking-widest uppercase text-[var(--color-text-muted)] mb-2">Your email</label>
                        <input ref={emailRef} type="email" value={email}
                          onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                          placeholder="your@email.com" className={inputClass} autoComplete="email" />
                        <AnimatePresence>{emailError && errorMsg(emailError)}</AnimatePresence>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] mb-6 leading-relaxed">
                        {isFree
                          ? 'A one-time access code will be sent to your inbox.'
                          : 'After payment, a one-time access code will be sent to your inbox.'}
                      </p>
                      {!isFree && (
                        <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                          <input
                            type="checkbox" checked={termsAccepted}
                            onChange={e => setTermsAccepted(e.target.checked)}
                            className="mt-0.5 w-4 h-4 shrink-0 accent-[var(--color-accent)] cursor-pointer"
                          />
                          <span className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                            I agree to the{' '}
                            <button type="button" onClick={e => { e.preventDefault(); setLegalDoc('terms'); }}
                              className="text-[var(--color-accent)] hover:underline underline-offset-2">
                              Terms &amp; Conditions
                            </button>
                            {' '}and{' '}
                            <button type="button" onClick={e => { e.preventDefault(); setLegalDoc('privacy'); }}
                              className="text-[var(--color-accent)] hover:underline underline-offset-2">
                              Privacy Policy
                            </button>
                            . I request immediate delivery and understand I waive my 14-day right of withdrawal once access is granted.
                          </span>
                        </label>
                      )}
                      <button type="submit" disabled={isSubmitting || (!isFree && !termsAccepted)} className={submitBtnClass}>
                        {isSubmitting ? 'Processing…' : isFree ? 'Get Free Access' : `Get Access  ·  ${priceLabel}`}
                      </button>
                    </form>
                    <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Already have a ticket?{' '}
                        <button onClick={() => { setEmailError(''); goTo('redeem-email', 1); }}
                          className="text-[var(--color-accent)] hover:underline underline-offset-2 transition-colors duration-200">
                          Enter your code →
                        </button>
                      </p>
                    </div>
                  </motion.div>
                )}

                {view === 'redeem-email' && (
                  <motion.div key="redeem-email" custom={direction} variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.22, ease: 'easeOut' as const }} className="p-10">
                    <div className="flex flex-col items-center text-center mb-8">
                      <span className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] font-medium mb-3 block">Already Have a Ticket</span>
                      <h2 className="font-serif text-2xl md:text-3xl mb-3">Enter Your Email</h2>
                      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                        We&apos;ll send a one-time code to the email linked to your ticket.
                      </p>
                    </div>
                    <form onSubmit={handleRedeemEmailSubmit} noValidate>
                      <div className="mb-6">
                        <label className="block text-xs tracking-widest uppercase text-[var(--color-text-muted)] mb-2">Email</label>
                        <input ref={emailRef} type="email" value={email}
                          onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                          placeholder="your@email.com" className={inputClass} autoComplete="email" />
                        <AnimatePresence>{emailError && errorMsg(emailError)}</AnimatePresence>
                      </div>
                      <button type="submit" disabled={isSubmitting} className={submitBtnClass}>
                        {isSubmitting ? 'Sending code…' : 'Send my code'}
                      </button>
                    </form>
                    <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Need a ticket?{' '}
                        <button onClick={() => { setEmailError(''); goTo('buy', -1); }}
                          className="text-[var(--color-accent)] hover:underline underline-offset-2 transition-colors duration-200">
                          Buy access →
                        </button>
                      </p>
                    </div>
                  </motion.div>
                )}

                {view === 'redeem-code' && (
                  <motion.div key="redeem-code" custom={direction} variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.22, ease: 'easeOut' as const }} className="p-10">
                    <div className="flex flex-col items-center text-center mb-8">
                      <span className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] font-medium mb-3 block">Check Your Inbox</span>
                      <h2 className="font-serif text-2xl md:text-3xl mb-3">Enter Your Code</h2>
                      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                        We sent a 6-digit code to{' '}
                        <span className="text-[var(--color-text)]">{email || 'your email'}</span>.
                        {' '}It expires in 15 minutes.
                      </p>
                    </div>
                    <form onSubmit={handleRedeemCodeSubmit} noValidate>
                      <div className="mb-6">
                        <label className="block text-xs tracking-widest uppercase text-[var(--color-text-muted)] mb-2">Access Code</label>
                        <input ref={otpRef} type="text" inputMode="numeric" pattern="[0-9]*"
                          maxLength={6} value={otp}
                          onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                          placeholder="000000"
                          className={`${inputClass} tracking-[0.5em] text-center font-mono text-lg`}
                          autoComplete="one-time-code" />
                        <AnimatePresence>{otpError && errorMsg(otpError)}</AnimatePresence>
                      </div>
                      <button type="submit" disabled={isSubmitting} className={submitBtnClass}>
                        {isSubmitting ? 'Verifying…' : 'Unlock Access'}
                      </button>
                    </form>
                    <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Didn&apos;t receive a code?{' '}
                        <button onClick={() => { setOtp(''); setOtpError(''); goTo('redeem-email', -1); }}
                          className="text-[var(--color-accent)] hover:underline underline-offset-2 transition-colors duration-200">
                          Resend →
                        </button>
                      </p>
                    </div>
                  </motion.div>
                )}

                {view === 'success' && (
                  <motion.div key="success" custom={direction} variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.22, ease: 'easeOut' as const }}
                    className="p-10 flex flex-col items-center text-center">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.1 }}
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                      style={{ background: 'rgba(212,175,55,0.12)' }}>
                      <CheckCircle className="w-8 h-8 text-[var(--color-accent)]" />
                    </motion.div>
                    <span className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] font-medium mb-3 block">Access Granted</span>
                    <h2 className="font-serif text-2xl md:text-3xl mb-3">Enjoy the Performance</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">Your {accessDays}-day access starts now.</p>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
