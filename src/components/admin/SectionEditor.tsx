'use client';
import React, { useEffect, useState } from 'react';
import type { LandingSection } from '@/types/landing';
import { createClient } from '@/lib/supabase/client';

interface ShowOption { slug: string; title: string; ticket_config: unknown; }

interface SectionEditorProps {
  section: LandingSection;
  onChange: (updated: LandingSection) => void;
}

const inputCls = 'w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e0d4] px-3 py-2 text-sm placeholder-[#5a5248] focus:outline-none focus:border-[#d4af37] transition-colors';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] tracking-wider uppercase text-[#8a7f72] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function extractYoutubeId(input: string): string {
  if (!input) return '';
  const match = input.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : input;
}

export function SectionEditor({ section, onChange }: SectionEditorProps) {
  const [shows, setShows] = useState<ShowOption[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.from('shows').select('slug, title, ticket_config').order('sort_order', { ascending: true })
      .then(({ data }) => setShows((data as ShowOption[]) ?? []));
  }, []);

  function set(fields: Partial<LandingSection>) {
    onChange({ ...section, ...fields } as LandingSection);
  }

  const allShows      = shows;
  const ticketedShows = shows.filter(s => s.ticket_config !== null);

  switch (section.type) {
    case 'hero':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title"><input className={inputCls} value={section.title} onChange={e => set({ title: e.target.value })} placeholder="Main headline…" /></Field>
          <Field label="Subtitle"><input className={inputCls} value={section.subtitle} onChange={e => set({ subtitle: e.target.value })} placeholder="Optional sub-headline…" /></Field>
          <Field label="Background image URL"><input className={inputCls} value={section.backgroundImage} onChange={e => set({ backgroundImage: e.target.value })} placeholder="/images/… or https://…" /></Field>
          <div />
          <Field label="Button text"><input className={inputCls} value={section.ctaText} onChange={e => set({ ctaText: e.target.value })} placeholder="Get Tickets" /></Field>
          <Field label="Button link"><input className={inputCls} value={section.ctaLink} onChange={e => set({ ctaLink: e.target.value })} placeholder="/universe/…" /></Field>
        </div>
      );

    case 'show_card':
      return (
        <Field label="Show">
          <select className={inputCls} value={section.showSlug} onChange={e => set({ showSlug: e.target.value })}>
            <option value="">Select a show…</option>
            {allShows.map(p => <option key={p.slug} value={p.slug}>{p.title}</option>)}
          </select>
        </Field>
      );

    case 'ticket_cta':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Show">
            <select className={inputCls} value={section.showSlug} onChange={e => set({ showSlug: e.target.value })}>
              <option value="">Select a show…</option>
              {ticketedShows.map(p => <option key={p.slug} value={p.slug}>{p.title}</option>)}
            </select>
          </Field>
          <Field label="Heading text"><input className={inputCls} value={section.heading} onChange={e => set({ heading: e.target.value })} placeholder="Don't miss it. Get your ticket." /></Field>
        </div>
      );

    case 'youtube':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="YouTube URL or video ID"><input className={inputCls} value={section.videoId} onChange={e => set({ videoId: extractYoutubeId(e.target.value) })} placeholder="https://youtube.com/watch?v=… or ID" /></Field>
          <Field label="Caption (optional)"><input className={inputCls} value={section.caption ?? ''} onChange={e => set({ caption: e.target.value })} placeholder="Caption text…" /></Field>
        </div>
      );

    case 'text':
      return (
        <div className="space-y-4">
          <Field label="Heading"><input className={inputCls} value={section.heading} onChange={e => set({ heading: e.target.value })} placeholder="Section heading…" /></Field>
          <Field label="Body"><textarea className={`${inputCls} resize-none h-24`} value={section.body} onChange={e => set({ body: e.target.value })} placeholder="Body paragraph…" /></Field>
        </div>
      );

    case 'image':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Image URL"><input className={inputCls} value={section.url} onChange={e => set({ url: e.target.value })} placeholder="/image.jpg or https://…" /></Field>
          <Field label="Caption (optional)"><input className={inputCls} value={section.caption ?? ''} onChange={e => set({ caption: e.target.value })} placeholder="Caption text…" /></Field>
        </div>
      );

    default:
      return null;
  }
}
