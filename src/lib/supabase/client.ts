import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Modern Supabase standard: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
// Backward-compatible fallback: NEXT_PUBLIC_SUPABASE_ANON_KEY
const rawKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  !rawUrl.includes('demo-tech-kiyas') &&
  rawKey &&
  !rawKey.includes('demo-anon-key') &&
  !rawKey.includes('demo-publishable-key')
);

// If real credentials are provided, initialize client; otherwise export null to avoid hanging network calls on unconfigured demo URLs
export const supabase = isSupabaseConfigured
  ? createClient(rawUrl!, rawKey!)
  : null;
