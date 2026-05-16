'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { createClient } from '@/lib/supabase/client';

interface VideoItem { id: string; title: string; }
interface FormState {
  slug: string; type: 'Album' | 'Single'; title: string; year: string; artist: string; cover: string;
  spotify_embed_url: string; bandcamp_embed_url: string; soundcloud_embed_url: string;
  secret_label: string; default_platform: 'spotify' | 'bandcamp'; description: string;
  videos: VideoItem[]; featured: boolean; sort_order: number;
}

const empty: FormState = { slug: '', type: 'Single', title: '', year: '', artist: 'Peter the Phantom', cover: '', spotify_embed_url: '', bandcamp_embed_url: '', soundcloud_embed_url: '', secret_label: '', default_platform: 'spotify', description: '', videos: [], featured: false, sort_order: 0 };

const inputCls = 'w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e0d4] px-3 py-2 text-sm placeholder-[#5a5248] focus:outline-none focus:border-[#d4af37] transition-colors';
const labelCls = 'block text-[10px] tracking-wider uppercase text-[#8a7f72] mb-1.5';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={labelCls}>{label}</label>{children}</div>;
}

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

export default function AdminReleaseFormPage() {
  const params = useParams<{ slug: string }>();
  const paramSlug = params.slug;
  const router = useRouter();
  const isNew = paramSlug === 'new';

  const [form, setForm]         = useState<FormState>(empty);
  const [loading, setLoading]   = useState(!isNew);
  const [saving, setSaving]     = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [error, setError]       = useState('');

  useEffect(() => {
    if (isNew) return;
    const supabase = createClient();
    supabase.from('releases').select('*').eq('slug', paramSlug).single()
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return; }
        if (data) setForm({ ...data, videos: data.videos ?? [] } as FormState);
        setLoading(false);
      });
  }, [paramSlug, isNew]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => {
      const next = { ...f, [key]: value };
      if (key === 'title' && isNew) next.slug = slugify(value as string);
      return next;
    });
  }

  function setVideo(index: number, field: keyof VideoItem, value: string) {
    setForm(f => { const videos = [...f.videos]; videos[index] = { ...videos[index], [field]: value }; return { ...f, videos }; });
  }

  function addVideo() { setForm(f => ({ ...f, videos: [...f.videos, { id: '', title: '' }] })); }
  function removeVideo(index: number) { setForm(f => ({ ...f, videos: f.videos.filter((_, i) => i !== index) })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    const supabase = createClient();
    let err;
    if (isNew) {
      ({ error: err } = await supabase.from('releases').insert(form));
    } else {
      ({ error: err } = await supabase.from('releases').update({ ...form, updated_at: new Date().toISOString() }).eq('slug', paramSlug));
    }
    setSaving(false);
    if (err) { setError(err.message); return; }
    setSavedMsg('Saved!');
    setTimeout(() => setSavedMsg(''), 2000);
    if (isNew) router.push('/admin/releases');
  }

  if (loading) return <div className="p-8"><p className="text-[#8a7f72] text-sm">Loading…</p></div>;

  return (
    <div className="p-8 max-w-3xl">
      <button onClick={() => router.push('/admin/releases')} className="flex items-center gap-2 text-xs tracking-wider uppercase text-[#8a7f72] hover:text-[#e8e0d4] transition-colors mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Releases
      </button>

      <div className="mb-8">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#d4af37] mb-1">{isNew ? 'New Release' : 'Edit Release'}</p>
        <h1 className="font-serif text-3xl">{isNew ? 'Create Release' : (form.title || paramSlug)}</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title"><input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Release title…" required /></Field>
          <Field label="Slug"><input className={inputCls} value={form.slug} onChange={e => set('slug', e.target.value)} required /></Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Type">
            <select className={inputCls} value={form.type} onChange={e => set('type', e.target.value as 'Album' | 'Single')}>
              <option value="Single">Single</option>
              <option value="Album">Album</option>
            </select>
          </Field>
          <Field label="Year"><input className={inputCls} value={form.year} onChange={e => set('year', e.target.value)} placeholder="2024" /></Field>
          <Field label="Artist"><input className={inputCls} value={form.artist} onChange={e => set('artist', e.target.value)} /></Field>
        </div>

        <ImageUpload label="Cover Art" value={form.cover} onChange={url => set('cover', url)} />

        <Field label="Description"><textarea className={`${inputCls} resize-none h-24`} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Short description…" /></Field>

        <Field label="Default Platform">
          <select className={inputCls} value={form.default_platform} onChange={e => set('default_platform', e.target.value as 'spotify' | 'bandcamp')}>
            <option value="spotify">Spotify</option>
            <option value="bandcamp">Bandcamp</option>
          </select>
        </Field>

        <Field label="Spotify Embed URL"><input className={inputCls} value={form.spotify_embed_url} onChange={e => set('spotify_embed_url', e.target.value)} placeholder="https://open.spotify.com/embed/…" /></Field>
        <Field label="Bandcamp Embed URL"><input className={inputCls} value={form.bandcamp_embed_url} onChange={e => set('bandcamp_embed_url', e.target.value)} placeholder="https://bandcamp.com/EmbeddedPlayer/…" /></Field>
        <Field label="SoundCloud Embed URL (Secret tab)"><input className={inputCls} value={form.soundcloud_embed_url} onChange={e => set('soundcloud_embed_url', e.target.value)} placeholder="https://w.soundcloud.com/player/…" /></Field>
        <Field label="Secret Tab Label"><input className={inputCls} value={form.secret_label} onChange={e => set('secret_label', e.target.value)} placeholder="Acoustic" /></Field>

        {/* Videos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className={labelCls}>Videos</label>
            <button type="button" onClick={addVideo} className="flex items-center gap-1 text-[10px] tracking-wider uppercase text-[#8a7f72] hover:text-[#d4af37] transition-colors">
              <Plus className="w-3 h-3" /> Add Video
            </button>
          </div>
          <div className="space-y-2">
            {form.videos.map((v, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input className={`${inputCls} flex-1`} value={v.id} onChange={e => setVideo(i, 'id', e.target.value)} placeholder="YouTube video ID" />
                <input className={`${inputCls} flex-1`} value={v.title} onChange={e => setVideo(i, 'title', e.target.value)} placeholder="Label (e.g. Official Music Video)" />
                <button type="button" onClick={() => removeVideo(i)} className="p-2 text-[#8a7f72] hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {form.videos.length === 0 && <p className="text-[#5a5248] text-xs">No videos yet — click Add Video.</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="featured" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 accent-[#d4af37]" />
            <label htmlFor="featured" className="text-sm text-[#e8e0d4]">Featured on homepage</label>
          </div>
          <Field label="Sort Order"><input type="number" className={inputCls} value={form.sort_order} onChange={e => set('sort_order', Number(e.target.value))} /></Field>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#d4af37] text-[#0d0d0d] text-xs tracking-wider uppercase font-medium hover:bg-[#c9a431] transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : isNew ? 'Create Release' : 'Save Changes'}
          </button>
          {savedMsg && <span className="text-xs text-green-400 tracking-wider">{savedMsg}</span>}
          {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
      </form>
    </div>
  );
}
