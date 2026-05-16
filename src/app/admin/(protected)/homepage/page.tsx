'use client';
import React, { useEffect, useState } from 'react';
import { ChevronUp, ChevronDown, Trash2, Plus, X } from 'lucide-react';
import { SectionEditor } from '@/components/admin/SectionEditor';
import { createClient } from '@/lib/supabase/client';
import type { LandingSection } from '@/types/landing';

function uid() { return Math.random().toString(36).slice(2, 10); }

const SECTION_TYPES: { type: LandingSection['type']; label: string; description: string }[] = [
  { type: 'hero',       label: 'Hero',          description: 'Full-screen image with title and CTA button' },
  { type: 'show_card',  label: 'Show Card',     description: 'Clickable card for one of your shows' },
  { type: 'ticket_cta', label: 'Ticket CTA',    description: 'Bold buy-ticket banner for a show' },
  { type: 'youtube',    label: 'YouTube Video', description: 'Embed any YouTube video' },
  { type: 'text',       label: 'Text Block',    description: 'Heading and a paragraph of text' },
  { type: 'image',      label: 'Image',         description: 'Single image with optional caption' },
];

function defaultSection(type: LandingSection['type']): LandingSection {
  const id = uid();
  switch (type) {
    case 'hero':       return { id, type, title: '', subtitle: '', backgroundImage: '', ctaText: 'Get Tickets', ctaLink: '/' };
    case 'show_card':  return { id, type, showSlug: '' };
    case 'ticket_cta': return { id, type, showSlug: '', heading: 'Get Your Ticket' };
    case 'youtube':    return { id, type, videoId: '', caption: '' };
    case 'text':       return { id, type, heading: '', body: '' };
    case 'image':      return { id, type, url: '', caption: '' };
  }
}

function sectionPreview(s: LandingSection): string {
  switch (s.type) {
    case 'hero':       return s.title || '(no title)';
    case 'show_card':  return s.showSlug || '(no show)';
    case 'ticket_cta': return s.showSlug || '(no show)';
    case 'youtube':    return s.videoId ? `youtu.be/${s.videoId}` : '(no video)';
    case 'text':       return s.heading || '(no heading)';
    case 'image':      return s.url || '(no url)';
  }
}

export default function AdminHomepagePage() {
  const [homeMode, setHomeMode]   = useState<'regular' | 'landing' | 'redirect'>('regular');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [sections, setSections]   = useState<LandingSection[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [savedMsg, setSavedMsg]   = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from('site_config').select('key, value').in('key', ['homepage_mode', 'landing_page_sections', 'homepage_redirect_url'])
      .then(({ data }) => {
        if (data) {
          const mode = data.find(r => r.key === 'homepage_mode')?.value ?? 'regular';
          const raw  = data.find(r => r.key === 'landing_page_sections')?.value ?? '[]';
          const rUrl = data.find(r => r.key === 'homepage_redirect_url')?.value ?? '';
          setHomeMode(mode as 'regular' | 'landing' | 'redirect');
          setRedirectUrl(rUrl);
          try { setSections(JSON.parse(raw)); } catch { setSections([]); }
        }
        setLoading(false);
      });
  }, []);

  async function saveAll() {
    setSaving(true); setSavedMsg('');
    const supabase = createClient();
    const { error } = await supabase.from('site_config').upsert([
      { key: 'homepage_mode',         value: homeMode,                updated_at: new Date().toISOString() },
      { key: 'landing_page_sections', value: JSON.stringify(sections), updated_at: new Date().toISOString() },
      { key: 'homepage_redirect_url', value: redirectUrl,              updated_at: new Date().toISOString() },
    ], { onConflict: 'key' });
    setSaving(false);
    setSavedMsg(error ? `Error: ${error.message}` : 'Saved!');
    if (!error) setTimeout(() => setSavedMsg(''), 3000);
  }

  function addSection(type: LandingSection['type']) {
    const s = defaultSection(type);
    setSections(prev => [...prev, s]);
    setExpandedId(s.id);
    setShowPicker(false);
  }

  function updateSection(updated: LandingSection) {
    setSections(prev => prev.map(s => s.id === updated.id ? updated : s));
  }

  function deleteSection(id: string) {
    setSections(prev => prev.filter(s => s.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  function move(index: number, dir: -1 | 1) {
    const arr = [...sections];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    setSections(arr);
  }

  if (loading) return <div className="p-8 text-[#8a7f72] text-sm">Loading…</div>;

  return (
    <div className="p-8 text-[#e8e0d4]">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#d4af37] mb-1">Configuration</p>
          <h1 className="font-serif text-3xl">Homepage</h1>
        </div>
        <div className="flex items-center gap-4 pt-1">
          {savedMsg && <span className={`text-sm ${savedMsg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{savedMsg}</span>}
          <button onClick={saveAll} disabled={saving} className="bg-[#d4af37] text-[#0a0a0a] px-6 py-2 text-xs font-medium tracking-widest uppercase hover:bg-[#c9a430] transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="mb-8 p-6 bg-[#111] border border-[#1e1e1e]">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#8a7f72] mb-4">Homepage Mode</p>
        <div className="flex gap-3 mb-3 flex-wrap">
          {([
            { value: 'regular', label: 'Regular Homepage' },
            { value: 'redirect', label: 'Redirect to Page' },
            { value: 'landing', label: 'Landing Page' },
          ] as const).map(({ value, label }) => (
            <button key={value} onClick={() => setHomeMode(value)}
              className={`px-6 py-2 text-xs tracking-widest uppercase border transition-colors ${homeMode === value ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10' : 'border-[#2a2a2a] text-[#8a7f72] hover:border-[#8a7f72]'}`}>
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#8a7f72] mb-4">
          {homeMode === 'regular' ? 'Visitors see the standard homepage.'
            : homeMode === 'redirect' ? 'Visitors are instantly redirected to the URL below.'
            : 'Visitors see the custom landing page you build below.'}
        </p>
        <div className={`transition-opacity ${homeMode === 'redirect' ? '' : 'opacity-40 pointer-events-none select-none'}`}>
          <label className="block text-[10px] tracking-wider uppercase text-[#8a7f72] mb-1.5">Redirect URL</label>
          <input className="w-full max-w-md bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e0d4] px-3 py-2 text-sm placeholder-[#5a5248] focus:outline-none focus:border-[#d4af37] transition-colors"
            value={redirectUrl} onChange={e => setRedirectUrl(e.target.value)} placeholder="/universe/planet-of-broken-dreams" />
        </div>
      </div>

      {/* Section builder */}
      <div className={homeMode !== 'landing' ? 'opacity-40 pointer-events-none select-none' : ''}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#8a7f72]">Landing Page Sections</p>
          <button onClick={() => setShowPicker(true)} className="flex items-center gap-1.5 text-xs tracking-wider uppercase text-[#d4af37] hover:text-[#e8e0d4] transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Section
          </button>
        </div>

        {sections.length === 0 ? (
          <div className="border border-dashed border-[#2a2a2a] py-16 text-center text-[#8a7f72] text-sm">
            No sections yet — click &quot;Add Section&quot; to start building.
          </div>
        ) : (
          <div className="space-y-1.5">
            {sections.map((section, index) => (
              <div key={section.id} className="border border-[#1e1e1e] bg-[#111]">
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="text-[10px] tracking-wider uppercase text-[#d4af37] w-24 shrink-0">{section.type.replace('_', ' ')}</span>
                  <span className="text-sm text-[#b0a89e] flex-1 truncate min-w-0">{sectionPreview(section)}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => move(index, -1)} disabled={index === 0} className="p-1.5 text-[#8a7f72] hover:text-[#e8e0d4] disabled:opacity-20 transition-colors" title="Move up"><ChevronUp className="w-4 h-4" /></button>
                    <button onClick={() => move(index, 1)} disabled={index === sections.length - 1} className="p-1.5 text-[#8a7f72] hover:text-[#e8e0d4] disabled:opacity-20 transition-colors" title="Move down"><ChevronDown className="w-4 h-4" /></button>
                    <button onClick={() => setExpandedId(expandedId === section.id ? null : section.id)} className="px-3 py-1 text-[10px] tracking-wider uppercase text-[#8a7f72] hover:text-[#e8e0d4] transition-colors">
                      {expandedId === section.id ? 'Close' : 'Edit'}
                    </button>
                    <button onClick={() => deleteSection(section.id)} className="p-1.5 text-[#8a7f72] hover:text-red-400 transition-colors" title="Delete section"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {expandedId === section.id && (
                  <div className="border-t border-[#1e1e1e] p-4 bg-[#0d0d0d]">
                    <SectionEditor section={section} onChange={updateSection} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section type picker */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6" onClick={() => setShowPicker(false)}>
          <div className="bg-[#111] border border-[#2a2a2a] p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl text-[#e8e0d4]">Add Section</h2>
              <button onClick={() => setShowPicker(false)} className="text-[#8a7f72] hover:text-[#e8e0d4] transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-1.5">
              {SECTION_TYPES.map(({ type, label, description }) => (
                <button key={type} onClick={() => addSection(type)} className="w-full text-left px-4 py-3 border border-[#2a2a2a] hover:border-[#d4af37] transition-colors group">
                  <span className="text-[10px] tracking-wider uppercase text-[#d4af37] block mb-0.5">{label}</span>
                  <span className="text-xs text-[#8a7f72]">{description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
