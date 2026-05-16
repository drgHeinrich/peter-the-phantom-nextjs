'use client';
import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ShowOption { slug: string; title: string; ticket_config: { access_days: number; price_in_cents: number } | null; }
interface Ticket {
  id: string; email: string; project_slug: string;
  stripe_session_id: string | null; access_expires_at: string; created_at: string;
}

const inputCls = 'w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e0d4] px-3 py-2 text-sm placeholder-[#5a5248] focus:outline-none focus:border-[#d4af37] transition-colors';
const labelCls = 'block text-[10px] tracking-wider uppercase text-[#8a7f72] mb-1.5';

export default function AdminTicketsPage() {
  const [shows, setShows]     = useState<ShowOption[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const [showPromo, setShowPromo]       = useState(false);
  const [promoEmail, setPromoEmail]     = useState('');
  const [promoSlug, setPromoSlug]       = useState('');
  const [promoDays, setPromoDays]       = useState(30);
  const [promoSaving, setPromoSaving]   = useState(false);
  const [promoError, setPromoError]     = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const supabase = createClient();
    const [showsRes, ticketsRes] = await Promise.all([
      supabase.from('shows').select('slug, title, ticket_config').eq('has_premium_content', true).order('sort_order'),
      supabase.from('tickets').select('*').order('created_at', { ascending: false }),
    ]);
    if (showsRes.error) setError(showsRes.error.message);
    else setShows((showsRes.data as ShowOption[]) ?? []);
    if (ticketsRes.error) setError(ticketsRes.error.message);
    else setTickets((ticketsRes.data as Ticket[]) ?? []);
    setLoading(false);
  }

  function openPromo() {
    setPromoEmail(''); setPromoSlug(shows[0]?.slug ?? ''); setPromoDays(30);
    setPromoError(''); setShowPromo(true);
  }

  function onShowChange(slug: string) {
    setPromoSlug(slug);
    const show = shows.find(s => s.slug === slug);
    setPromoDays(show?.ticket_config?.access_days ?? 30);
  }

  async function createPromo(e: React.FormEvent) {
    e.preventDefault();
    if (!promoEmail.trim() || !promoSlug) { setPromoError('Email and show are required.'); return; }
    setPromoSaving(true); setPromoError('');
    const supabase = createClient();
    const expiresAt = new Date(Date.now() + promoDays * 24 * 60 * 60 * 1000).toISOString();
    const { error: err } = await supabase.from('tickets').insert({
      email: promoEmail.trim().toLowerCase(),
      project_slug: promoSlug,
      stripe_session_id: null,
      access_expires_at: expiresAt,
    });
    setPromoSaving(false);
    if (err) { setPromoError(err.message); return; }
    setShowPromo(false);
    load();
  }

  async function revokeTicket(ticket: Ticket) {
    if (!window.confirm(`Revoke ticket for ${ticket.email} on "${ticket.project_slug}"?\nThey will lose access immediately.`)) return;
    const supabase = createClient();
    const { error: err } = await supabase.from('tickets')
      .update({ access_expires_at: new Date().toISOString() })
      .eq('id', ticket.id);
    if (err) { alert(err.message); return; }
    setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, access_expires_at: new Date().toISOString() } : t));
  }

  const now = new Date().toISOString();
  const totalTickets  = tickets.length;
  const paidTickets   = tickets.filter(t => t.stripe_session_id).length;
  const activeTickets = tickets.filter(t => t.access_expires_at > now).length;

  const showMetrics = shows.map(show => {
    const rows = tickets.filter(t => t.project_slug === show.slug);
    if (rows.length === 0) return null;
    const paid = rows.filter(t => t.stripe_session_id).length;
    const priceInCents = show.ticket_config?.price_in_cents ?? 0;
    return {
      name: show.title, slug: show.slug,
      total: rows.length, paid, free: rows.length - paid,
      active: rows.filter(t => t.access_expires_at > now).length,
      revenue: (paid * priceInCents) / 100,
    };
  }).filter(Boolean) as Array<{ name: string; slug: string; total: number; paid: number; free: number; active: number; revenue: number }>;

  const totalRevenue = showMetrics.reduce((sum, m) => sum + m.revenue, 0);

  const statCards = [
    { label: 'Total Tickets', value: totalTickets },
    { label: 'Active Now',    value: activeTickets },
    { label: 'Paid Tickets',  value: paidTickets },
    { label: 'Est. Revenue',  value: `€${totalRevenue.toFixed(2)}` },
  ];

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#d4af37] mb-1">Management</p>
          <h1 className="font-serif text-3xl">Tickets</h1>
        </div>
        <button
          onClick={openPromo}
          className="flex items-center gap-2 px-4 py-2 border border-[#d4af37] text-[#d4af37] text-xs tracking-wider uppercase hover:bg-[#d4af37] hover:text-[#0d0d0d] transition-colors mt-1"
        >
          <Plus className="w-3.5 h-3.5" /> Create Promo Ticket
        </button>
      </div>

      {loading ? (
        <p className="text-[#8a7f72] text-sm">Loading…</p>
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            {statCards.map(({ label, value }) => (
              <div key={label} className="bg-[#111] border border-[#1e1e1e] p-5">
                <p className="text-[10px] tracking-wider uppercase text-[#8a7f72] mb-2">{label}</p>
                <p className="font-serif text-3xl">{value}</p>
              </div>
            ))}
          </div>

          {/* By-show breakdown */}
          {showMetrics.length > 0 && (
            <div className="mb-10">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#8a7f72] mb-3">By Show</p>
              <div className="border border-[#1e1e1e] overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1e1e1e] text-left">
                      {['Show', 'Total', 'Paid', 'Free / Promo', 'Active', 'Revenue'].map(h => (
                        <th key={h} className="px-5 py-3 text-[10px] tracking-wider uppercase text-[#8a7f72] font-normal whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {showMetrics.map(m => (
                      <tr key={m.slug} className="border-b border-[#1e1e1e] last:border-0">
                        <td className="px-5 py-3">{m.name}</td>
                        <td className="px-5 py-3">{m.total}</td>
                        <td className="px-5 py-3 text-[#d4af37]">{m.paid}</td>
                        <td className="px-5 py-3 text-[#8a7f72]">{m.free}</td>
                        <td className="px-5 py-3">{m.active}</td>
                        <td className="px-5 py-3">€{m.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* All tickets */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#8a7f72] mb-3">All Tickets</p>
            <div className="border border-[#1e1e1e] overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e1e1e] text-left">
                    {['Email', 'Show', 'Type', 'Issued', 'Expires', 'Status', ''].map(h => (
                      <th key={h} className="px-5 py-3 text-[10px] tracking-wider uppercase text-[#8a7f72] font-normal whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tickets.length === 0 ? (
                    <tr><td colSpan={7} className="px-5 py-10 text-center text-[#8a7f72] text-sm">No tickets yet.</td></tr>
                  ) : tickets.map(t => {
                    const isActive = t.access_expires_at > now;
                    return (
                      <tr key={t.id} className="border-b border-[#1e1e1e] last:border-0 hover:bg-[#111] transition-colors">
                        <td className="px-5 py-3 text-[#b0a89e]">{t.email}</td>
                        <td className="px-5 py-3 text-xs text-[#8a7f72] font-mono">{t.project_slug}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] px-2 py-0.5 uppercase tracking-wider ${t.stripe_session_id ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'bg-[#222] text-[#8a7f72]'}`}>
                            {t.stripe_session_id ? 'Paid' : 'Promo'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-[#8a7f72] whitespace-nowrap">{new Date(t.created_at).toLocaleDateString()}</td>
                        <td className="px-5 py-3 text-xs text-[#8a7f72] whitespace-nowrap">{new Date(t.access_expires_at).toLocaleDateString()}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs ${isActive ? 'text-green-400' : 'text-[#8a7f72]'}`}>
                            {isActive ? 'Active' : 'Expired'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {isActive && (
                            <button
                              onClick={() => revokeTicket(t)}
                              className="text-xs tracking-wider uppercase text-[#8a7f72] hover:text-red-400 transition-colors"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Create Promo Ticket modal */}
      {showPromo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6" onClick={() => setShowPromo(false)}>
          <div className="bg-[#111] border border-[#2a2a2a] p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl text-[#e8e0d4]">Create Promo Ticket</h2>
              <button onClick={() => setShowPromo(false)} className="text-[#8a7f72] hover:text-[#e8e0d4] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={createPromo} className="space-y-4">
              <div>
                <label className={labelCls}>Email</label>
                <input
                  className={inputCls}
                  type="email"
                  value={promoEmail}
                  onChange={e => setPromoEmail(e.target.value)}
                  placeholder="recipient@email.com"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className={labelCls}>Show</label>
                <select className={inputCls} value={promoSlug} onChange={e => onShowChange(e.target.value)} required>
                  {shows.length === 0
                    ? <option value="">No premium shows found</option>
                    : shows.map(s => <option key={s.slug} value={s.slug}>{s.title}</option>)
                  }
                </select>
              </div>
              <div>
                <label className={labelCls}>Access Days</label>
                <input
                  className={inputCls}
                  type="number"
                  min={1}
                  value={promoDays}
                  onChange={e => setPromoDays(Number(e.target.value))}
                />
              </div>
              {promoError && <p className="text-xs text-red-400">{promoError}</p>}
              <button
                type="submit"
                disabled={promoSaving || shows.length === 0}
                className="w-full py-2.5 bg-[#d4af37] text-[#0d0d0d] text-xs tracking-wider uppercase font-medium hover:bg-[#c9a431] transition-colors disabled:opacity-50"
              >
                {promoSaving ? 'Creating…' : 'Create Ticket'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
