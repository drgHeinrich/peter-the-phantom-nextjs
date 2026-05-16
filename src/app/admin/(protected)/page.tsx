'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ShowRow { slug: string; title: string; ticket_config: { price_in_cents: number } | null; }
interface Ticket {
  id: string; email: string; project_slug: string;
  stripe_session_id: string | null; access_expires_at: string; created_at: string;
}

export default function AdminDashboardPage() {
  const [shows, setShows]     = useState<ShowRow[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from('shows').select('slug, title, ticket_config').order('sort_order'),
      supabase.from('tickets').select('*').order('created_at', { ascending: false }),
    ]).then(([showsRes, ticketsRes]) => {
      if (showsRes.error) setError(showsRes.error.message);
      else setShows((showsRes.data as ShowRow[]) ?? []);
      if (ticketsRes.error) setError(ticketsRes.error.message);
      else setTickets((ticketsRes.data as Ticket[]) ?? []);
      setLoading(false);
    });
  }, []);

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
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#d4af37] mb-1">Overview</p>
        <h1 className="font-serif text-3xl">Metrics</h1>
      </div>

      {loading ? (
        <p className="text-[#8a7f72] text-sm">Loading…</p>
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            {statCards.map(({ label, value }) => (
              <div key={label} className="bg-[#111] border border-[#1e1e1e] p-5">
                <p className="text-[10px] tracking-wider uppercase text-[#8a7f72] mb-2">{label}</p>
                <p className="font-serif text-3xl">{value}</p>
              </div>
            ))}
          </div>

          {showMetrics.length > 0 && (
            <div className="mb-10">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#8a7f72] mb-3">By Show</p>
              <div className="border border-[#1e1e1e] overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1e1e1e] text-left">
                      {['Show', 'Total', 'Paid', 'Free', 'Active', 'Revenue'].map(h => (
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

          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#8a7f72] mb-3">Recent Activity</p>
            <div className="border border-[#1e1e1e] overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e1e1e] text-left">
                    {['Email', 'Show', 'Type', 'Date', 'Status'].map(h => (
                      <th key={h} className="px-5 py-3 text-[10px] tracking-wider uppercase text-[#8a7f72] font-normal whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tickets.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-[#8a7f72] text-sm">No tickets yet.</td></tr>
                  ) : tickets.slice(0, 25).map(t => (
                    <tr key={t.id} className="border-b border-[#1e1e1e] last:border-0">
                      <td className="px-5 py-3 text-[#b0a89e]">{t.email}</td>
                      <td className="px-5 py-3 text-xs text-[#8a7f72]">{t.project_slug}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] px-2 py-0.5 uppercase tracking-wider ${t.stripe_session_id ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'bg-[#222] text-[#8a7f72]'}`}>
                          {t.stripe_session_id ? 'Paid' : 'Free'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-[#8a7f72] whitespace-nowrap">{new Date(t.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-xs">
                        <span className={t.access_expires_at > now ? 'text-green-400' : 'text-[#8a7f72]'}>
                          {t.access_expires_at > now ? 'Active' : 'Expired'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
