'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ReleaseRow { id: number; slug: string; type: 'Album' | 'Single'; title: string; year: string; featured: boolean; sort_order: number; }

export default function AdminReleasesPage() {
  const router = useRouter();
  const [releases, setReleases] = useState<ReleaseRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.from('releases').select('id, slug, type, title, year, featured, sort_order')
      .order('sort_order', { ascending: true })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setReleases((data as ReleaseRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: number, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const supabase = createClient();
    const { error: err } = await supabase.from('releases').delete().eq('id', id);
    if (err) { alert(err.message); return; }
    setReleases(prev => prev.filter(r => r.id !== id));
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#d4af37] mb-1">Content</p>
          <h1 className="font-serif text-3xl">Releases</h1>
        </div>
        <button
          onClick={() => router.push('/admin/releases/new')}
          className="flex items-center gap-2 px-4 py-2 border border-[#d4af37] text-[#d4af37] text-xs tracking-wider uppercase hover:bg-[#d4af37] hover:text-[#0d0d0d] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Release
        </button>
      </div>

      {loading ? <p className="text-[#8a7f72] text-sm">Loading…</p>
        : error ? <p className="text-red-400 text-sm">{error}</p>
        : (
          <div className="border border-[#1e1e1e] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e1e] text-left">
                  {['#', 'Title', 'Type', 'Year', 'Slug', 'Featured', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-[10px] tracking-wider uppercase text-[#8a7f72] font-normal whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {releases.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-[#8a7f72] text-sm">No releases yet.</td></tr>
                ) : releases.map(r => (
                  <tr key={r.id} className="border-b border-[#1e1e1e] last:border-0 hover:bg-[#111] transition-colors">
                    <td className="px-5 py-3 text-[#8a7f72]">{r.sort_order}</td>
                    <td className="px-5 py-3 font-medium">{r.title}</td>
                    <td className="px-5 py-3 text-xs text-[#8a7f72]">{r.type}</td>
                    <td className="px-5 py-3 text-xs text-[#8a7f72]">{r.year}</td>
                    <td className="px-5 py-3 text-xs text-[#8a7f72] font-mono">{r.slug}</td>
                    <td className="px-5 py-3">
                      {r.featured ? <span className="text-[10px] px-2 py-0.5 uppercase tracking-wider bg-[#222] text-[#e8e0d4]">Yes</span> : <span className="text-[10px] text-[#8a7f72]">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => router.push(`/admin/releases/${r.slug}`)} className="text-xs tracking-wider uppercase text-[#8a7f72] hover:text-[#d4af37] transition-colors">Edit</button>
                        <button onClick={() => handleDelete(r.id, r.title)} className="text-xs tracking-wider uppercase text-[#8a7f72] hover:text-red-400 transition-colors">Delete</button>
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
