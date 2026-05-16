import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const envCheck = {
    url_defined: !!url,
    url_prefix: url ? url.slice(0, 20) : null,
    key_defined: !!key,
    key_prefix: key ? key.slice(0, 10) : null,
  };

  let queryResult = null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('shows').select('id, title').limit(3);
    queryResult = { data, error: error?.message ?? null };
  } catch (e) {
    queryResult = { data: null, error: String(e) };
  }

  return NextResponse.json({ envCheck, queryResult });
}
