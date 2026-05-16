'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Camera, Lock, X, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { Footer } from './Footer';
import { SecretGateModal } from './SecretGateModal';
import { SecretButton } from './SecretButton';
import { TicketModal } from './TicketModal';
import { NotifyMeSection } from './NotifyMeSection';
import { MuxVideoPlayer } from './MuxVideoPlayer';
import { isSecretUnlocked, unlockSecret } from '@/utils/secretAccess';
import { hasValidAccess, getMuxToken } from '@/utils/ticketAccess';
import type { Project } from '@/types/project';
import type { Release } from '@/types/release';

interface Props {
  project: Project;
  album: Release | null;
  checkoutSuccess: boolean;
}

export function UniverseDetailClient({ project, album, checkoutSuccess }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? 'universe';
  const backLabel = from === 'universe' ? 'Back to Universe' : 'Back to Home';

  const slug = project.slug;

  const [isUnlocked, setIsUnlocked]   = useState(() => hasValidAccess(slug));
  const [muxToken, setMuxToken]       = useState<string | null>(() => getMuxToken(slug));
  const [checkoutEmail, setCheckoutEmail] = useState<string | undefined>(undefined);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<{ src: string; type: string } | null>(null);

  // Handle Stripe checkout success redirect
  useEffect(() => {
    if (!checkoutSuccess) return;
    try {
      const pending = JSON.parse(localStorage.getItem('ptp_pending_checkout') ?? '{}');
      if (pending.email) setCheckoutEmail(pending.email);
      localStorage.removeItem('ptp_pending_checkout');
    } catch { /* ignore */ }
    setShowTicketModal(true);
  }, [checkoutSuccess]);

  useEffect(() => {
    if (!lightboxItem) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxItem(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxItem]);

  function defaultPlatform(): 'bandcamp' | 'spotify' {
    if (album?.defaultPlatform) return album.defaultPlatform;
    return album?.bandcampEmbedUrl ? 'bandcamp' : 'spotify';
  }

  const [streamingPlatform, setStreamingPlatform] = useState<'bandcamp' | 'spotify' | 'secret'>(defaultPlatform);
  const [showSecretGate, setShowSecretGate] = useState(false);
  const [secretUnlocked, setSecretUnlocked] = useState(() => isSecretUnlocked());

  function handleSecretClick() {
    if (secretUnlocked) {
      setStreamingPlatform('secret');
    } else {
      setShowSecretGate(true);
    }
  }

  function handleUnlock(email: string) {
    unlockSecret(email);
    setSecretUnlocked(true);
    setShowSecretGate(false);
    setStreamingPlatform('secret');
  }

  function handleBack() {
    if (from === 'universe') {
      router.push('/universe');
    } else {
      router.push('/');
    }
  }

  const hasSecret = Boolean(album?.soundcloudEmbedUrl);
  const hasBandcamp = Boolean(album?.bandcampEmbedUrl);
  const showToggle = hasBandcamp || hasSecret;
  const tabs = [
    ...(hasBandcamp ? ['bandcamp' as const] : []),
    'spotify' as const,
    ...(hasSecret ? ['secret' as const] : []),
  ];
  const tabCount = tabs.length;
  const activeTabIndex = tabs.indexOf(streamingPlatform as typeof tabs[number]);
  const indicatorLeft = activeTabIndex >= 0
    ? `calc(4px + ${activeTabIndex} * (100% - 8px) / ${tabCount})`
    : '4px';
  const indicatorWidth = `calc((100% - 8px) / ${tabCount})`;

  const showPremiumContent = project.hasPremiumContent !== false;
  const comingSoon = Boolean(project.contentComingSoon);

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex items-center justify-between bg-gradient-to-b from-[var(--color-bg)] to-transparent">
        <button
          onClick={handleBack}
          className="group flex items-center gap-2 text-sm uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          {backLabel}
        </button>
      </nav>

      {/* Hero */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-transparent z-10" />
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5 }}
            src={project.heroImage} alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
            <span className="inline-block text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] font-medium mb-6">
              {project.subtitle}
            </span>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-8 leading-tight">{project.title}</h1>
            <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-12 leading-relaxed">
              {project.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {showPremiumContent && (
                <Button variant="primary"
                  onClick={() => comingSoon || isUnlocked
                    ? document.getElementById('performance')?.scrollIntoView({ behavior: 'smooth' })
                    : setShowTicketModal(true)}
                  className="min-w-[200px]">
                  {isUnlocked && !comingSoon ? 'Watch Now' : `Unlock Access · ${project.price}`}
                </Button>
              )}
              {!showPremiumContent && project.notifyTrack && (
                <Button variant="primary"
                  onClick={() => document.getElementById('performance')?.scrollIntoView({ behavior: 'smooth' })}
                  className="min-w-[200px]">
                  See the Show
                </Button>
              )}
              <Button variant="secondary"
                onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}>
                Read the Story
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trailer */}
      {project.trailerUrl && (
        <section className="py-24 md:py-32 px-6 border-t border-[var(--color-border)]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <span className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] font-medium mb-4 block">Preview</span>
              <h2 className="font-serif text-3xl md:text-5xl text-[var(--color-text)] tracking-tight">Watch the Trailer</h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.8, delay: 0.2 }}
              className="relative aspect-video bg-[var(--color-bg-alt)] overflow-hidden border border-[var(--color-border)]"
            >
              <iframe src={project.trailerUrl} title={`${project.title} trailer`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center text-sm tracking-wide text-[var(--color-text-muted)] mt-8"
            >
              {project.trailerCaption}
            </motion.p>
          </div>
        </section>
      )}

      {/* Story */}
      <section id="story" className="py-24 md:py-32 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8 }}
            >
              <span className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] font-medium mb-4 block">The Narrative</span>
              <h2 className="font-serif text-3xl md:text-4xl mb-8">Behind the Concept</h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed text-lg">{project.story}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="relative aspect-[4/5] bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-2"
            >
              <img src={project.image} alt="Concept art" className="w-full h-full object-cover object-top" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Performance */}
      {(showPremiumContent || project.notifyTrack) && (
        <section id="performance" className="py-24 bg-[var(--color-bg-alt)] border-y border-[var(--color-border)]">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <span className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] font-medium mb-4 block">
              {comingSoon ? 'Coming Soon' : showPremiumContent ? 'Exclusive Content' : 'Stay Connected'}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl mb-12">The Performance</h2>

            <div className="relative aspect-video bg-black border border-[var(--color-border)] overflow-hidden group">
              {showPremiumContent && !comingSoon && isUnlocked && project.muxPlaybackId && muxToken ? (
                <MuxVideoPlayer playbackId={project.muxPlaybackId} token={muxToken} />
              ) : showPremiumContent && !comingSoon && isUnlocked && project.muxPlaybackId && !muxToken ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
                  <h3 className="text-2xl font-serif mb-2">Session Expired</h3>
                  <p className="text-[var(--color-text-muted)] mb-8">Please re-enter your code to continue watching.</p>
                  <Button variant="primary" onClick={() => setShowTicketModal(true)}>Re-verify Access</Button>
                </div>
              ) : showPremiumContent && !comingSoon ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
                  <Lock className="w-12 h-12 text-[var(--color-text-muted)] mb-4" />
                  <h3 className="text-2xl font-serif mb-2">Premium Content</h3>
                  <p className="text-[var(--color-text-muted)] mb-8">Purchase access to watch the full performance</p>
                  <Button variant="primary" onClick={() => setShowTicketModal(true)}>Unlock for {project.price}</Button>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10 px-6">
                  <p className="text-xs tracking-[0.25em] uppercase text-[var(--color-accent)] font-medium mb-4">
                    {comingSoon ? 'Recording in progress' : 'Show archive'}
                  </p>
                  <h3 className="text-2xl font-serif mb-2">
                    {comingSoon ? 'Coming Soon' : 'Future dates TBA'}
                  </h3>
                  <p className="text-[var(--color-text-muted)] text-sm mb-8 max-w-sm">
                    {comingSoon
                      ? "We're editing the full recording. Leave your email and we'll notify you the moment it's online."
                      : "Want to see this show live? We'll let you know when new dates are announced."}
                  </p>
                  <NotifyMeSection track={project.notifyTrack!} heading="Notify me" subheading="" />
                </div>
              )}
              {!(isUnlocked && project.muxPlaybackId && muxToken && !comingSoon) && (
                <img src={project.heroImage} alt="Performance preview"
                  className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" />
              )}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {project.gallery.length > 0 && (
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] font-medium mb-4 block">Behind the Scenes</span>
                <h2 className="font-serif text-3xl md:text-4xl">Making Of</h2>
              </div>
              <Camera className="w-6 h-6 text-[var(--color-text-muted)]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {project.gallery.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.6 }}
                  onClick={() => setLightboxItem(item)}
                  className="aspect-square bg-[var(--color-bg-alt)] border border-[var(--color-border)] overflow-hidden group cursor-pointer relative"
                >
                  {item.type === 'video' ? (
                    <>
                      <iframe src={item.src} title={`Gallery video ${index + 1}`}
                        className="w-full h-full pointer-events-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Play className="w-12 h-12 text-white drop-shadow-lg" />
                      </div>
                    </>
                  ) : (
                    <>
                      <img src={item.src} alt={`Making of ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Camera className="w-10 h-10 text-white drop-shadow-lg" />
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Album */}
      {album && (
        <section className="py-24 px-6 border-t border-[var(--color-border)] bg-[var(--color-bg-alt)]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] font-medium mb-4 block">Soundtrack</span>
              <h2 className="font-serif text-3xl md:text-4xl">
                Based on{' '}
                <button
                  onClick={() => router.push(`/music/${album.slug}?from=show`)}
                  className="text-[var(--color-accent)] hover:underline underline-offset-4 decoration-[var(--color-accent)]/50 transition-all duration-300 cursor-pointer"
                >
                  {album.title}
                </button>
              </h2>
            </div>

            {showToggle && (
              <div className="flex justify-center mb-10">
                <div className="flex p-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-full relative">
                  <div
                    className="absolute top-1 bottom-1 bg-[var(--color-text)] rounded-full transition-all duration-300 ease-out"
                    style={{ left: indicatorLeft, width: indicatorWidth }}
                  />
                  {hasBandcamp && (
                    <button
                      onClick={() => setStreamingPlatform('bandcamp')}
                      className={`relative z-10 px-6 py-2 text-sm font-medium tracking-wider uppercase transition-colors duration-300 ${streamingPlatform === 'bandcamp' ? 'text-[var(--color-bg)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                    >
                      Bandcamp
                    </button>
                  )}
                  <button
                    onClick={() => setStreamingPlatform('spotify')}
                    className={`relative z-10 px-6 py-2 text-sm font-medium tracking-wider uppercase transition-colors duration-300 ${streamingPlatform === 'spotify' ? 'text-[var(--color-bg)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                  >
                    Spotify
                  </button>
                  {hasSecret && (
                    <SecretButton
                      onClick={handleSecretClick}
                      className={`relative z-10 px-5 py-2 text-sm font-medium tracking-wider uppercase transition-colors duration-300 flex items-center gap-1.5 ${streamingPlatform === 'secret' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-accent)]'}`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {secretUnlocked ? (album.secretLabel ?? 'Secret') : 'Secret'}
                    </SecretButton>
                  )}
                </div>
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8 }}
            >
              <div className="relative">
                <AnimatePresence mode="wait">
                  {streamingPlatform === 'bandcamp' && album.bandcampEmbedUrl ? (
                    <motion.div key="bandcamp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="w-full flex justify-center">
                      <iframe
                        style={{ border: 0, maxWidth: '700px', width: '100%', height: album.type === 'Album' ? '406px' : '120px' }}
                        src={album.bandcampEmbedUrl} seamless title={`${album.title} on Bandcamp`}
                      />
                    </motion.div>
                  ) : streamingPlatform === 'secret' && album.soundcloudEmbedUrl ? (
                    <motion.div key="secret" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="w-full">
                      <iframe
                        width="100%" height={album.type === 'Album' ? '450' : '166'}
                        src={album.soundcloudEmbedUrl} allow="autoplay"
                        title={`${album.title} — ${album.secretLabel ?? 'Secret Goodies'}`}
                        style={{ border: 0 }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div key="spotify" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="w-full">
                      <iframe
                        src={album.spotifyEmbedUrl} width="100%" height="352" frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy" className="rounded-xl" title={`${album.title} on Spotify`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <SecretGateModal isOpen={showSecretGate} onUnlock={handleUnlock} onClose={() => setShowSecretGate(false)} />

      <TicketModal
        isOpen={showTicketModal}
        project={project}
        initialEmail={checkoutEmail}
        onUnlock={() => { setIsUnlocked(true); setMuxToken(getMuxToken(slug)); setShowTicketModal(false); }}
        onClose={() => setShowTicketModal(false)}
      />

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setLightboxItem(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }} transition={{ duration: 0.3 }}
              className="relative w-full max-w-5xl max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setLightboxItem(null)}
                className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors duration-200 z-10"
                aria-label="Close"
              >
                <X className="w-7 h-7" />
              </button>
              {lightboxItem.type === 'video' ? (
                <div className="aspect-video w-full">
                  <iframe src={lightboxItem.src} title="Gallery video" className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen />
                </div>
              ) : (
                <img src={lightboxItem.src} alt="Behind the scenes" className="w-full max-h-[85vh] object-contain" />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
