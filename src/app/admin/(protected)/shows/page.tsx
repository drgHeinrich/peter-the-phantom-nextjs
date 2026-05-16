'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ShowRow { id: number; slug: string; title: string; subtitle: string; featured: boolean; sort_order: number; has_premium_content: boolean; }

export default function AdminShowsPage() {
  const router = useRouter();
  const [shows, setShows]     = useState<ShowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.from('shows').select('id, slug, title, subtitle, featured, sort_order, has_premium_content')
      .order('sort_order', { ascending: true })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setShows((data as ShowRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: number, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const supabase = createClient();
    const { error: err } = await supabase.from('shows').delete().eq('id', id);
    if (err) { alert(err.message); return; }
    setShows(prev => prev.filter(s => s.id !== id));
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#d4af37] mb-1">Content</p>
          <h1 className="font-serif text-3xl">Shows</h1>
        </div>
        <button
          onClick={() => router.push('/admin/shows/new')}
          className="flex items-center gap-2 px-4 py-2 border border-[#d4af37] text-[#d4af37] text-xs tracking-wider uppercase hover:bg-[#d4af37] hover:text-[#0d0d0d] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Show
        </button>
      </div>

      {loading ? <p className="text-[#8a7f72] text-sm">Loading…</p>
        : error ? <p className="text-red-400 text-sm">{error}</p>
        : (
          <div className="border border-[#1e1e1e] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e1e] text-left">
                  {['#', 'Title', 'Slug', 'Premium', 'Featured', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-[10px] tracking-wider uppercase text-[#8a7f72] font-normal whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shows.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-[#8a7f72] text-sm">No shows yet.</td></tr>
                ) : shows.map(s => (
                  <tr key={s.id} className="border-b border-[#1e1e1e] last:border-0 hover:bg-[#111] transition-colors">
                    <td className="px-5 py-3 text-[#8a7f72]">{s.sort_order}</td>
                    <td className="px-5 py-3 font-medium">{s.title}</td>
                    <td className="px-5 py-3 text-xs text-[#8a7f72] font-mono">{s.slug}</td>
                    <td className="px-5 py-3">
                      {s.has_premium_content ? <span className="text-[10px] px-2 py-0.5 uppercase tracking-wider bg-[#d4af37]/10 text-[#d4af37]">Yes</span> : <span className="text-[10px] text-[#8a7f72]">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      {s.featured ? <span className="text-[10px] px-2 py-0.5 uppercase tracking-wider bg-[#222] text-[#e8e0d4]">Yes</span> : <span className="text-[10px] text-[#8a7f72]">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => router.push(`/admin/shows/${s.slug}`)} className="text-xs tracking-wider uppercase text-[#8a7f72] hover:text-[#d4af37] transition-colors">Edit</button>
                        <button onClick={() => handleDelete(s.id, s.title)} className="text-xs tracking-wider uppercase text-[#8a7f72] hover:text-red-400 transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
