'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export type LegalDoc = 'terms' | 'privacy';

interface LegalModalProps {
  doc: LegalDoc | null;
  onClose: () => void;
}

export function LegalModal({ doc, onClose }: LegalModalProps) {
  useEffect(() => {
    if (!doc) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [doc, onClose]);

  return (
    <AnimatePresence>
      {doc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[300] flex items-start justify-center p-4 md:p-8 overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' as const }}
            className="relative w-full max-w-2xl bg-[var(--color-bg)] border border-[var(--color-border)] my-8"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-200"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 md:p-12 prose-legal">
              {doc === 'terms' ? <TermsContent /> : <PrivacyContent />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── shared typography helpers ─────────────────────────────────────────────────

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-serif text-3xl text-[var(--color-text)] mb-2">{children}</h1>
  );
}
function Meta({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-text-muted)] mb-10">{children}</p>
  );
}
function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-lg text-[var(--color-text)] mt-8 mb-3">{children}</h2>
  );
}
function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4">{children}</p>
  );
}
function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4 list-disc list-inside space-y-1">{children}</ul>
  );
}

// ── Terms & Conditions ────────────────────────────────────────────────────────

function TermsContent() {
  return (
    <>
      <H1>Terms &amp; Conditions</H1>
      <Meta>Last updated: April 2026</Meta>

      <P>
        These terms govern your purchase and use of digital content on peterthephantom.com,
        operated by Peter the Phantom. By completing a purchase you agree to these terms.
      </P>

      <H2>1. What you are purchasing</H2>
      <P>
        When you buy a ticket you receive time-limited access to a specific digital performance
        recording. Access is personal and non-transferable. The access period starts at the moment
        your one-time code is redeemed and lasts for the number of days stated at checkout (typically 30 days).
      </P>

      <H2>2. Price and currency</H2>
      <P>
        Prices are shown in Euros (EUR). Depending on your location, Stripe may convert and charge
        in your local currency using their adaptive pricing. The EUR amount is the authoritative price.
        All prices include any applicable VAT.
      </P>

      <H2>3. Delivery</H2>
      <P>
        After a successful payment, a one-time access code is sent to the email address you provided
        at checkout. You must enter this code on the website to unlock the content. Codes expire after
        15 minutes but a new code can be requested at any time via the "Already have a ticket?" flow.
      </P>

      <H2>4. Right of withdrawal — digital content waiver</H2>
      <P>
        Under EU consumer law (Directive 2011/83/EU) you normally have 14 days to withdraw from a
        distance purchase. However, for digital content not supplied on a physical medium, this right
        is lost once delivery has begun with your prior express consent.
      </P>
      <P>
        By ticking the consent checkbox and completing your purchase you expressly request immediate
        delivery and acknowledge that you lose your right of withdrawal once access is granted.
      </P>

      <H2>5. Refunds</H2>
      <P>
        Because delivery of digital content begins immediately upon code redemption, we do not offer
        refunds after a code has been redeemed. If you experience a technical issue that prevents you
        from accessing the content, contact us at <a href="mailto:contact@peterthephantom.com" className="text-[var(--color-accent)] hover:underline">contact@peterthephantom.com</a> and
        we will resolve it or issue a refund at our discretion.
      </P>
      <P>
        If you have been charged but have not yet redeemed your code, you may request a full refund
        within 14 days of purchase.
      </P>

      <H2>6. Intellectual property</H2>
      <P>
        All content — video, audio, images, and text — is the exclusive property of Peter the Phantom.
        Purchasing access does not grant you any rights to download, copy, redistribute, or otherwise
        reproduce the content.
      </P>

      <H2>7. Governing law</H2>
      <P>
        These terms are governed by Romanian law. Any disputes will be subject to the jurisdiction
        of the courts of Romania. EU consumers retain any statutory rights afforded by the law of
        their country of residence.
      </P>

      <H2>8. Contact</H2>
      <P>
        For any questions regarding these terms:{' '}
        <a href="mailto:contact@peterthephantom.com" className="text-[var(--color-accent)] hover:underline">
          contact@peterthephantom.com
        </a>
      </P>
    </>
  );
}

// ── Privacy Policy ────────────────────────────────────────────────────────────

function PrivacyContent() {
  return (
    <>
      <H1>Privacy Policy</H1>
      <Meta>Last updated: April 2026</Meta>

      <P>
        This policy explains what personal data peterthephantom.com collects, why, and how it is
        handled. The site is operated by Peter the Phantom. As a visitor or customer based in the EU
        you have rights under the General Data Protection Regulation (GDPR).
      </P>

      <H2>1. Data we collect and why</H2>
      <UL>
        <li><strong>Email address</strong> — collected when you purchase a ticket, sign up for the
        newsletter, or submit a notify-me request. Used to send your access code, order confirmation,
        and (if subscribed) editorial updates.</li>
        <li><strong>Payment data</strong> — processed directly by Stripe. We never see or store your
        card details. Stripe's privacy policy applies to payment data.</li>
        <li><strong>Access tokens</strong> — a short-lived token stored in your browser's localStorage
        to remember that you have valid access to a recording. This data never leaves your device.</li>
      </UL>

      <H2>2. Legal basis (GDPR)</H2>
      <UL>
        <li><strong>Contract performance</strong> (Art. 6(1)(b)) — processing your email to deliver
        the access code you purchased.</li>
        <li><strong>Legitimate interest</strong> (Art. 6(1)(f)) — notifying you of content or show
        dates you explicitly requested.</li>
        <li><strong>Consent</strong> (Art. 6(1)(a)) — newsletter subscription. You may withdraw
        consent at any time by clicking "unsubscribe" in any email.</li>
      </UL>

      <H2>3. Third-party processors</H2>
      <UL>
        <li><strong>Supabase</strong> — database and backend infrastructure (EU region). Stores email,
        ticket metadata, and hashed access codes. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">Privacy policy →</a></li>
        <li><strong>Stripe</strong> — payment processing. Operates under its own privacy policy and
        PCI-DSS compliance. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">Privacy policy →</a></li>
        <li><strong>Resend</strong> — transactional email delivery (access codes, confirmations). <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">Privacy policy →</a></li>
        <li><strong>Brevo</strong> — newsletter and marketing emails. <a href="https://www.brevo.com/legal/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">Privacy policy →</a></li>
        <li><strong>Mux</strong> — video hosting and streaming. <a href="https://mux.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">Privacy policy →</a></li>
        <li><strong>YouTube</strong> — embedded trailers and gallery videos. YouTube may set cookies
        and collect data as described in Google's privacy policy.</li>
      </UL>

      <H2>4. Retention</H2>
      <P>
        Ticket and email records are kept for as long as your access is valid, plus a reasonable
        period for dispute resolution (up to 1 year after expiry). Newsletter subscriptions are kept
        until you unsubscribe.
      </P>

      <H2>5. Your rights</H2>
      <P>Under GDPR you have the right to:</P>
      <UL>
        <li>Access the personal data we hold about you</li>
        <li>Request correction of inaccurate data</li>
        <li>Request deletion ("right to be forgotten")</li>
        <li>Object to processing based on legitimate interest</li>
        <li>Lodge a complaint with your national data protection authority</li>
      </UL>
      <P>
        To exercise any of these rights, contact us at{' '}
        <a href="mailto:contact@peterthephantom.com" className="text-[var(--color-accent)] hover:underline">
          contact@peterthephantom.com
        </a>
        . We will respond within 30 days.
      </P>

      <H2>6. Cookies</H2>
      <P>
        This site does not use tracking or analytics cookies. localStorage is used only for your
        access token (functional, session-scoped). Embedded YouTube and Spotify iframes may set
        their own cookies — you can block these via your browser settings.
      </P>

      <H2>7. Contact</H2>
      <P>
        <a href="mailto:contact@peterthephantom.com" className="text-[var(--color-accent)] hover:underline">
          contact@peterthephantom.com
        </a>
      </P>
    </>
  );
}
