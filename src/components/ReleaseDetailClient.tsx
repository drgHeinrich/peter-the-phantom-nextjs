'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { Footer } from './Footer';
import { SecretGateModal } from './SecretGateModal';
import { SecretButton } from './SecretButton';
import { isSecretUnlocked, unlockSecret } from '@/utils/secretAccess';
import type { Release } from '@/types/release';

interface Props {
  release: Release;
}

export function ReleaseDetailClient({ release }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? 'music';

  const backLabel = from === 'show' ? 'Back to Show' : from === 'home' ? 'Back to Home' : 'Back to Music';

  function handleBack() {
    if (from === 'show') {
      router.back();
    } else if (from === 'home') {
      router.push('/');
    } else {
      router.push('/music');
    }
  }

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  function defaultPlatform(): 'bandcamp' | 'spotify' {
    if (release.defaultPlatform) return release.defaultPlatform;
    return release.bandcampEmbedUrl ? 'bandcamp' : 'spotify';
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

  const hasSecret = Boolean(release.soundcloudEmbedUrl);
  const hasBandcamp = Boolean(release.bandcampEmbedUrl);
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

  const goToPrev = () => setCurrentVideoIndex(prev => Math.max(0, prev - 1));
  const goToNext = () => setCurrentVideoIndex(prev => Math.min(release.videos.length - 1, prev + 1));

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
      <section className="relative pt-32 pb-16 md:pt-48 md:pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[var(--color-bg-alt)]/50 z-0" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-[350px_1fr] gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="aspect-square shadow-2xl border border-[var(--color-border)]"
            >
              <img src={release.cover} alt={release.title} className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] font-medium mb-4 block">
                {release.type} • {release.year}
              </span>
              <h1 className="font-serif text-5xl md:text-7xl mb-6 leading-tight">{release.title}</h1>
              <p className="text-xl text-[var(--color-text-muted)] mb-8 max-w-2xl leading-relaxed">
                {release.description}
              </p>
              <Button variant="primary" onClick={() => document.getElementById('listen')?.scrollIntoView({ behavior: 'smooth' })}>
                Listen Now
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Streaming */}
      <section id="listen" className="py-16 px-6 border-t border-[var(--color-border)] bg-[var(--color-bg-alt)]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col items-center mb-8">
              <h2 className="font-serif text-3xl mb-6 text-center">
                {streamingPlatform === 'secret'
                  ? (release.secretLabel ?? 'Secret Goodies')
                  : `Stream on ${streamingPlatform === 'bandcamp' ? 'Bandcamp' : 'Spotify'}`}
              </h2>

              {showToggle && (
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
                      {secretUnlocked ? (release.secretLabel ?? 'Secret') : 'Secret'}
                    </SecretButton>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <AnimatePresence mode="wait">
                {streamingPlatform === 'bandcamp' && release.bandcampEmbedUrl ? (
                  <motion.div key="bandcamp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="w-full flex justify-center">
                    <iframe
                      style={{ border: 0, maxWidth: '700px', width: '100%', height: release.type === 'Album' ? '406px' : '120px' }}
                      src={release.bandcampEmbedUrl} seamless title={`${release.title} on Bandcamp`}
                    />
                  </motion.div>
                ) : streamingPlatform === 'secret' && release.soundcloudEmbedUrl ? (
                  <motion.div key="secret" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="w-full">
                    <iframe
                      width="100%" height={release.type === 'Album' ? '450' : '166'}
                      src={release.soundcloudEmbedUrl} allow="autoplay"
                      title={`${release.title} — ${release.secretLabel ?? 'Secret Goodies'}`}
                      style={{ border: 0 }}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="spotify" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="w-full">
                    <iframe
                      style={{ borderRadius: '12px' }}
                      src={release.spotifyEmbedUrl} width="100%"
                      height={release.type === 'Album' ? '352' : '152'}
                      frameBorder="0" allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy" title={`${release.title} on Spotify`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Carousel */}
      {release.videos.length > 0 && (
        <section className="py-24 px-6 border-t border-[var(--color-border)]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <span className="text-xs tracking-[0.3em] uppercase text-[var(--color-accent)] font-medium mb-4 block">Visuals</span>
              <h2 className="font-serif text-3xl md:text-4xl">Music Videos</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Vintage CRT TV */}
              <div className="relative mx-auto max-w-4xl">
                {/* Antenna */}
                <div className="flex justify-center relative z-10 mb-[-2px]">
                  <div className="relative" style={{ width: '80px', height: '55px' }}>
                    <div className="absolute bottom-0 left-1/2" style={{ width: '3px', height: '55px', background: 'linear-gradient(to top, #8a8a8a, #c0c0c0, #a0a0a0)', transform: 'rotate(-25deg)', transformOrigin: 'bottom center', borderRadius: '2px', boxShadow: '1px 0 2px rgba(0,0,0,0.3)' }} />
                    <div className="absolute bottom-0 left-1/2" style={{ width: '3px', height: '55px', background: 'linear-gradient(to top, #8a8a8a, #c0c0c0, #a0a0a0)', transform: 'rotate(25deg)', transformOrigin: 'bottom center', borderRadius: '2px', boxShadow: '-1px 0 2px rgba(0,0,0,0.3)' }} />
                    <div className="absolute rounded-full" style={{ width: '6px', height: '6px', background: 'radial-gradient(circle at 30% 30%, #d0d0d0, #888)', top: '0px', left: '14px' }} />
                    <div className="absolute rounded-full" style={{ width: '6px', height: '6px', background: 'radial-gradient(circle at 30% 30%, #d0d0d0, #888)', top: '0px', right: '14px' }} />
                  </div>
                </div>

                {/* TV Cabinet */}
                <div className="relative rounded-[16px] overflow-hidden" style={{ background: 'linear-gradient(180deg, #5c3d2e 0%, #4a3122 30%, #3d2819 70%, #2e1e12 100%)', boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 0 rgba(0,0,0,0.3)', padding: '20px' }}>
                  <div className="absolute inset-0 pointer-events-none opacity-20 rounded-[16px]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px), repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(139,90,60,0.15) 20px, rgba(139,90,60,0.15) 21px)' }} />
                  <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, #3d2819, #7a5438, #8b6544, #7a5438, #3d2819)' }} />

                  <div className="relative flex gap-0">
                    <div className="flex-1">
                      <div className="rounded-[8px] p-[10px]" style={{ background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.05)' }}>
                        <div className="relative rounded-[6px] overflow-hidden" style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.9), inset 0 0 4px rgba(0,0,0,1)' }}>
                          <div className="relative aspect-video bg-black">
                            <iframe
                              key={release.videos[currentVideoIndex].id}
                              src={`https://www.youtube.com/embed/${release.videos[currentVideoIndex].id}`}
                              title={release.videos[currentVideoIndex].title}
                              className="w-full h-full relative z-10"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                            <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.4) 1px, rgba(0,0,0,0.4) 3px)' }} />
                            <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(255,255,255,0.02) 0%, transparent 40%)' }} />
                            <div className="absolute inset-0 z-20 pointer-events-none" style={{ boxShadow: 'inset 0 0 80px rgba(0,0,0,0.4)' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Control Panel */}
                    <div className="hidden md:flex flex-col items-center justify-between py-4 px-5 ml-4 min-w-[80px]" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.2))', borderRadius: '8px' }}>
                      <div className="w-full space-y-[4px] mb-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="w-full h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, transparent 5%, #1a1a1a 20%, #1a1a1a 80%, transparent 95%)', boxShadow: '0 1px 0 rgba(255,255,255,0.03)' }} />
                        ))}
                      </div>
                      <div className="flex flex-col items-center gap-1 mb-4">
                        <div className="w-10 h-10 rounded-full relative" style={{ background: 'conic-gradient(from 0deg, #3a3a3a, #555, #3a3a3a, #555, #3a3a3a)', boxShadow: '0 3px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)', border: '2px solid #2a2a2a' }}>
                          <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-[2px] h-[8px] rounded-full" style={{ background: '#ddd' }} />
                        </div>
                        <span style={{ fontSize: '7px', color: '#8a7560', letterSpacing: '0.1em' }}>CH</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 mb-4">
                        <div className="w-8 h-8 rounded-full relative" style={{ background: 'conic-gradient(from 0deg, #3a3a3a, #555, #3a3a3a, #555, #3a3a3a)', boxShadow: '0 3px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)', border: '2px solid #2a2a2a' }}>
                          <div className="absolute top-[3px] left-1/2 -translate-x-1/2 w-[2px] h-[6px] rounded-full" style={{ background: '#ddd' }} />
                        </div>
                        <span style={{ fontSize: '7px', color: '#8a7560', letterSpacing: '0.1em' }}>VOL</span>
                      </div>
                      <div className="flex flex-col items-center gap-3 mt-auto">
                        <div className="w-[6px] h-[6px] rounded-full" style={{ background: '#4ade80', boxShadow: '0 0 8px rgba(74,222,128,0.6), 0 0 2px rgba(74,222,128,0.8)' }} />
                        <span className="font-serif italic" style={{ fontSize: '8px', color: '#9a8470', letterSpacing: '0.15em' }}>PHANTOM</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:hidden flex items-center justify-between mt-4 px-2">
                    <span style={{ fontSize: '8px', color: '#8a7560', letterSpacing: '0.3em' }}>PHANTOM</span>
                    <div className="w-[6px] h-[6px] rounded-full" style={{ background: '#4ade80', boxShadow: '0 0 8px rgba(74,222,128,0.6)' }} />
                  </div>
                </div>

                {/* TV Legs */}
                <div className="flex justify-center mt-0">
                  <div className="flex" style={{ gap: '200px' }}>
                    <div style={{ width: '8px', height: '28px', background: 'linear-gradient(180deg, #4a3122, #3d2819, #2e1e12)', borderRadius: '0 0 3px 3px', transform: 'perspective(100px) rotateY(5deg)', boxShadow: '2px 4px 8px rgba(0,0,0,0.3)' }} />
                    <div style={{ width: '8px', height: '28px', background: 'linear-gradient(180deg, #4a3122, #3d2819, #2e1e12)', borderRadius: '0 0 3px 3px', transform: 'perspective(100px) rotateY(-5deg)', boxShadow: '-2px 4px 8px rgba(0,0,0,0.3)' }} />
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-center gap-6 mt-10">
                <button
                  onClick={goToPrev} disabled={currentVideoIndex === 0}
                  className="p-3 border border-[var(--color-border)] bg-[var(--color-bg)] rounded-full hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Previous video"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-lg font-medium">{release.videos[currentVideoIndex].title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono tracking-wide text-[var(--color-text-muted)]">
                      {currentVideoIndex + 1} / {release.videos.length}
                    </span>
                    <div className="flex gap-1.5">
                      {release.videos.map((_, i) => (
                        <button
                          key={i} onClick={() => setCurrentVideoIndex(i)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentVideoIndex ? 'bg-[var(--color-accent)] w-6' : 'bg-[var(--color-border)] hover:bg-[var(--color-text-muted)]'}`}
                          aria-label={`Go to video ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={goToNext} disabled={currentVideoIndex === release.videos.length - 1}
                  className="p-3 border border-[var(--color-border)] bg-[var(--color-bg)] rounded-full hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Next video"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <SecretGateModal isOpen={showSecretGate} onUnlock={handleUnlock} onClose={() => setShowSecretGate(false)} />

      <Footer />
    </main>
  );
}
