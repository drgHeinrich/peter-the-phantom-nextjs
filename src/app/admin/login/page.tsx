'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.replace('/admin');
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#d4af37] font-medium mb-2">Admin</p>
          <h1 className="font-serif text-3xl text-[#e8e0d4]">Peter the Phantom</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} required
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#e8e0d4] px-4 py-3 text-sm placeholder-[#5a5248] focus:outline-none focus:border-[#d4af37] transition-colors"
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} required
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#e8e0d4] px-4 py-3 text-sm placeholder-[#5a5248] focus:outline-none focus:border-[#d4af37] transition-colors"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-[#d4af37] text-[#0a0a0a] py-3 text-xs font-medium tracking-widest uppercase hover:bg-[#c9a430] transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
