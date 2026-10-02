import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

// Server-side writes require the secret key to bypass RLS policies
// Modern standard: SUPABASE_SECRET_KEY
// Backward-compatible fallback: SUPABASE_SERVICE_ROLE_KEY
const rawSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseServerConfigured = Boolean(
  typeof window === 'undefined' &&
  rawUrl &&
  !rawUrl.includes('demo-tech-kiyas') &&
  rawSecretKey &&
  !rawSecretKey.includes('demo-secret-key') &&
  !rawSecretKey.includes('demo-service-role')
);

let cachedServerClient: SupabaseClient | null = null;

/**
 * Returns a server-only Supabase client with elevated privileges for authorized backend mutations.
 * Enforces a strict isolation barrier: returns null if accessed from browser runtimes.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  // Hard isolation barrier: Never initialize or expose secret client in browser runtime
  if (typeof window !== 'undefined') {
    return null;
  }

  if (!isSupabaseServerConfigured) {
    return null;
  }

  if (!cachedServerClient && rawUrl && rawSecretKey) {
    cachedServerClient = createClient(rawUrl, rawSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cachedServerClient;
}
