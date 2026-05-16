import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const envCheck = {
    url_defined: !!url,
    url_prefix: url ? url.slice(0, 30) : null,
    key_defined: !!key,
    key_prefix: key ? key.slice(0, 10) : null,
  };

  let internetCheck = null;
  try {
    const res = await fetch('https://httpbin.org/get', { signal: AbortSignal.timeout(5000) });
    internetCheck = { status: res.status, ok: res.ok };
  } catch (e) {
    internetCheck = { error: String(e) };
  }

  let rawFetch = null;
  try {
    const res = await fetch(`${url}/rest/v1/shows?select=id,title&limit=3`, {
      headers: {
        apikey: key!,
        Authorization: `Bearer ${key}`,
      },
      signal: AbortSignal.timeout(10000),
    });
    const text = await res.text();
    rawFetch = { status: res.status, body: text.slice(0, 300) };
  } catch (e) {
    rawFetch = { status: null, error: String(e) };
  }

  let clientQuery = null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('shows').select('id, title').limit(3);
    clientQuery = { data, error: error?.message ?? null };
  } catch (e) {
    clientQuery = { data: null, error: String(e) };
  }

  return NextResponse.json({ envCheck, internetCheck, rawFetch, clientQuery });
}
