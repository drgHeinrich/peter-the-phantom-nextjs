'use client';
import React, { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

const inputCls = 'flex-1 bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e0d4] px-3 py-2 text-sm placeholder-[#5a5248] focus:outline-none focus:border-[#d4af37] transition-colors';

export function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const supabase = createClient();
    const { error: uploadErr } = await supabase.storage.from('media').upload(path, file, { upsert: false });
    if (uploadErr) { setError(uploadErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      {label && <label className="block text-[10px] tracking-wider uppercase text-[#8a7f72] mb-1.5">{label}</label>}
      <div className="flex gap-2">
        <input className={inputCls} value={value} onChange={e => onChange(e.target.value)} placeholder="/images/filename.jpg or https://…" />
        <button
          type="button" disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="px-3 py-2 text-[10px] tracking-wider uppercase border border-[#2a2a2a] text-[#8a7f72] hover:border-[#d4af37] hover:text-[#d4af37] transition-colors disabled:opacity-40 whitespace-nowrap"
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      {value && <img src={value} alt="preview" className="mt-2 h-16 w-16 object-cover border border-[#2a2a2a]" />}
    </div>
  );
}
