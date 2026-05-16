'use client';
import React from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Ticket, LayoutDashboard, LogOut, Film, Disc } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/admin/tickets',  label: 'Tickets',  icon: Ticket,          exact: false },
  { href: '/admin/homepage', label: 'Homepage', icon: LayoutDashboard, exact: false },
  { href: '/admin/shows',    label: 'Shows',    icon: Film,            exact: false },
  { href: '/admin/releases', label: 'Releases', icon: Disc,            exact: false },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/admin/login');
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex text-[#e8e0d4]">
      <aside className="w-52 shrink-0 bg-[#0a0a0a] border-r border-[#1e1e1e] flex flex-col">
        <div className="px-5 py-5 border-b border-[#1e1e1e]">
          <p className="text-[9px] tracking-[0.35em] uppercase text-[#d4af37] mb-0.5">Admin</p>
          <p className="font-serif text-sm text-[#e8e0d4]">Peter the Phantom</p>
        </div>

        <nav className="flex-1 py-3">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href} href={href}
                className={`flex items-center gap-2.5 px-5 py-2.5 text-xs tracking-wider uppercase transition-colors ${
                  isActive ? 'text-[#d4af37] bg-[#181818]' : 'text-[#8a7f72] hover:text-[#e8e0d4]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-5 py-4 text-xs tracking-wider uppercase text-[#8a7f72] hover:text-[#e8e0d4] transition-colors border-t border-[#1e1e1e]"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
