'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { createClient } from '@/lib/supabase/client';

interface GalleryItem { type: 'image' | 'video'; src: string; }
interface TicketConfig { price_in_cents: number; currency: 'eur' | 'usd' | 'ron'; access_days: number; stripe_product_id_test: string; stripe_product_id_live: string; }
interface ReleaseOption { id: number; slug: string; title: string; }
interface FormState {
  slug: string; title: string; subtitle: string; description: string; story: string;
  image: string; hero_image: string; price: string; trailer_url: string; trailer_caption: string;
  gallery: GalleryItem[]; album_id: number | null;
  has_premium_content: boolean; content_coming_soon: boolean;
  notify_track: string; mux_playback_id: string;
  ticket_config: TicketConfig | null; featured: boolean; sort_order: number;
}

const emptyTicket: TicketConfig = { price_in_cents: 0, currency: 'eur', access_days: 30, stripe_product_id_test: '', stripe_product_id_live: '' };
const empty: FormState = { slug: '', title: '', subtitle: '', description: '', story: '', image: '', hero_image: '', price: '', trailer_url: '', trailer_caption: '', gallery: [], album_id: null, has_premium_content: false, content_coming_soon: false, notify_track: '', mux_playback_id: '', ticket_config: null, featured: false, sort_order: 0 };

const inputCls = 'w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e0d4] px-3 py-2 text-sm placeholder-[#5a5248] focus:outline-none focus:border-[#d4af37] transition-colors';
const labelCls = 'block text-[10px] tracking-wider uppercase text-[#8a7f72] mb-1.5';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={labelCls}>{label}</label>{children}</div>;
}

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

export default function AdminShowFormPage() {
  const params = useParams<{ slug: string }>();
  const paramSlug = params.slug;
  const router = useRouter();
  const isNew = paramSlug === 'new';

  const [form, setForm]         = useState<FormState>(empty);
  const [loading, setLoading]   = useState(!isNew);
  const [saving, setSaving]     = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [error, setError]       = useState('');
  const [releases, setReleases] = useState<ReleaseOption[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.from('releases').select('id, slug, title').order('sort_order', { ascending: true })
      .then(({ data }) => setReleases((data as ReleaseOption[]) ?? []));
  }, []);

  useEffect(() => {
    if (isNew) return;
    const supabase = createClient();
    supabase.from('shows').select('*').eq('slug', paramSlug).single()
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return; }
        if (data) setForm({ ...data, gallery: data.gallery ?? [], ticket_config: data.ticket_config ?? null } as FormState);
        setLoading(false);
      });
  }, [paramSlug, isNew]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => {
      const next = { ...f, [key]: value };
      if (key === 'title' && isNew) next.slug = slugify(value as string);
      if (key === 'has_premium_content' && value && !f.ticket_config) next.ticket_config = { ...emptyTicket };
      return next;
    });
  }

  function setTicket<K extends keyof TicketConfig>(key: K, value: TicketConfig[K]) {
    setForm(f => ({ ...f, ticket_config: { ...(f.ticket_config ?? emptyTicket), [key]: value } }));
  }

  function setGallery(index: number, field: keyof GalleryItem, value: string) {
    setForm(f => { const gallery = [...f.gallery]; gallery[index] = { ...gallery[index], [field]: value }; return { ...f, gallery }; });
  }

  function addGalleryItem() { setForm(f => ({ ...f, gallery: [...f.gallery, { type: 'image', src: '' }] })); }
  function removeGalleryItem(index: number) { setForm(f => ({ ...f, gallery: f.gallery.filter((_, i) => i !== index) })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    const payload = { ...form, ticket_config: form.has_premium_content ? form.ticket_config : null };
    const supabase = createClient();
    let err;
    if (isNew) {
      ({ error: err } = await supabase.from('shows').insert(payload));
    } else {
      ({ error: err } = await supabase.from('shows').update({ ...payload, updated_at: new Date().toISOString() }).eq('slug', paramSlug));
    }
    setSaving(false);
    if (err) { setError(err.message); return; }
    setSavedMsg('Saved!');
    setTimeout(() => setSavedMsg(''), 2000);
    if (isNew) router.push('/admin/shows');
  }

  if (loading) return <div className="p-8"><p className="text-[#8a7f72] text-sm">Loading…</p></div>;

  return (
    <div className="p-8 max-w-3xl">
      <button onClick={() => router.push('/admin/shows')} className="flex items-center gap-2 text-xs tracking-wider uppercase text-[#8a7f72] hover:text-[#e8e0d4] transition-colors mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Shows
      </button>

      <div className="mb-8">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#d4af37] mb-1">{isNew ? 'New Show' : 'Edit Show'}</p>
        <h1 className="font-serif text-3xl">{isNew ? 'Create Show' : (form.title || paramSlug)}</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title"><input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Show title…" required /></Field>
          <Field label="Slug"><input className={inputCls} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-generated" required /></Field>
        </div>

        <Field label="Subtitle"><input className={inputCls} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="e.g. Generative Live Performance" /></Field>
        <Field label="Description"><textarea className={`${inputCls} resize-none h-24`} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Short intro paragraph…" /></Field>
        <Field label="Story (behind the scenes)"><textarea className={`${inputCls} resize-none h-40`} value={form.story} onChange={e => set('story', e.target.value)} placeholder="Long narrative text…" /></Field>

        <ImageUpload label="Card Image" value={form.image} onChange={url => set('image', url)} />
        <ImageUpload label="Hero Image (full-screen)" value={form.hero_image} onChange={url => set('hero_image', url)} />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Trailer URL (YouTube embed)"><input className={inputCls} value={form.trailer_url} onChange={e => set('trailer_url', e.target.value)} placeholder="https://www.youtube.com/embed/…" /></Field>
          <Field label="Trailer Caption"><input className={inputCls} value={form.trailer_caption} onChange={e => set('trailer_caption', e.target.value)} placeholder='"Show Name" — Official Trailer' /></Field>
        </div>

        {/* Gallery */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className={labelCls}>Gallery</label>
            <button type="button" onClick={addGalleryItem} className="flex items-center gap-1 text-[10px] tracking-wider uppercase text-[#8a7f72] hover:text-[#d4af37] transition-colors">
              <Plus className="w-3 h-3" /> Add Item
            </button>
          </div>
          <div className="space-y-2">
            {form.gallery.map((item, i) => (
              <div key={i} className="flex gap-2 items-start">
                <select className={`${inputCls} w-28`} value={item.type} onChange={e => setGallery(i, 'type', e.target.value)}>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
                {item.type === 'image' ? (
                  <div className="flex-1"><ImageUpload value={item.src} onChange={url => setGallery(i, 'src', url)} /></div>
                ) : (
                  <input className={`${inputCls} flex-1`} value={item.src} onChange={e => setGallery(i, 'src', e.target.value)} placeholder="https://www.youtube.com/embed/…" />
                )}
                <button type="button" onClick={() => removeGalleryItem(i)} className="p-2 text-[#8a7f72] hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {form.gallery.length === 0 && <p className="text-[#5a5248] text-xs">No gallery items yet.</p>}
          </div>
        </div>

        <Field label="Linked Album / Release">
          <select className={inputCls} value={form.album_id ?? ''} onChange={e => set('album_id', e.target.value ? Number(e.target.value) : null)}>
            <option value="">None</option>
            {releases.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
        </Field>

        <Field label="Price Display (e.g. €4.99 — leave blank for free)">
          <input className={inputCls} value={form.price} onChange={e => set('price', e.target.value)} placeholder="€4.99" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="featured" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 accent-[#d4af37]" />
            <label htmlFor="featured" className="text-sm text-[#e8e0d4]">Featured</label>
          </div>
          <Field label="Sort Order"><input type="number" className={inputCls} value={form.sort_order} onChange={e => set('sort_order', Number(e.target.value))} /></Field>
        </div>

        {/* Premium */}
        <div className="border border-[#1e1e1e] p-5 space-y-5">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="hasPremium" checked={form.has_premium_content} onChange={e => set('has_premium_content', e.target.checked)} className="w-4 h-4 accent-[#d4af37]" />
            <label htmlFor="hasPremium" className="text-sm text-[#e8e0d4] font-medium">Has Premium Content</label>
          </div>
          {form.has_premium_content && (
            <div className="space-y-5 pl-7">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="comingSoon" checked={form.content_coming_soon} onChange={e => set('content_coming_soon', e.target.checked)} className="w-4 h-4 accent-[#d4af37]" />
                <label htmlFor="comingSoon" className="text-sm text-[#e8e0d4]">Content Coming Soon (show notify form)</label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Notify Track Slug"><input className={inputCls} value={form.notify_track} onChange={e => set('notify_track', e.target.value)} placeholder="my-show-slug" /></Field>
                <Field label="Mux Playback ID"><input className={inputCls} value={form.mux_playback_id} onChange={e => set('mux_playback_id', e.target.value)} placeholder="jn7I00Zb1LTX…" /></Field>
              </div>
              <p className={labelCls}>Ticket Config</p>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Price (cents)"><input type="number" className={inputCls} value={form.ticket_config?.price_in_cents ?? 0} onChange={e => setTicket('price_in_cents', Number(e.target.value))} /></Field>
                <Field label="Currency">
                  <select className={inputCls} value={form.ticket_config?.currency ?? 'eur'} onChange={e => setTicket('currency', e.target.value as 'eur' | 'usd' | 'ron')}>
                    <option value="eur">EUR</option><option value="usd">USD</option><option value="ron">RON</option>
                  </select>
                </Field>
                <Field label="Access Days"><input type="number" className={inputCls} value={form.ticket_config?.access_days ?? 30} onChange={e => setTicket('access_days', Number(e.target.value))} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Stripe Product ID (test)"><input className={inputCls} value={form.ticket_config?.stripe_product_id_test ?? ''} onChange={e => setTicket('stripe_product_id_test', e.target.value)} placeholder="prod_…" /></Field>
                <Field label="Stripe Product ID (live)"><input className={inputCls} value={form.ticket_config?.stripe_product_id_live ?? ''} onChange={e => setTicket('stripe_product_id_live', e.target.value)} placeholder="prod_…" /></Field>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#d4af37] text-[#0d0d0d] text-xs tracking-wider uppercase font-medium hover:bg-[#c9a431] transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : isNew ? 'Create Show' : 'Save Changes'}
          </button>
          {savedMsg && <span className="text-xs text-green-400 tracking-wider">{savedMsg}</span>}
          {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
      </form>
    </div>
  );
}
