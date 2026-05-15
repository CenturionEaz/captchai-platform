import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase browser client — uses public ANON key only.
 * Safe to use in Client Components ("use client").
 * Never passes service role key — that lives server-side only.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
