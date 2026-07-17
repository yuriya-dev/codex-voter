import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn("⚠️ WARNING: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing from environment variables! Realtime features will be disabled.");
}

// Safe dummy fallback client for prerendering/build and configuration-free runs
const dummyChannel = {
  on: () => dummyChannel,
  subscribe: () => dummyChannel,
  unsubscribe: () => Promise.resolve(),
};

const dummySupabase = {
  channel: () => dummyChannel,
  removeChannel: () => Promise.resolve(),
  from: () => ({
    select: () => ({
      order: () => ({
        limit: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  }),
  auth: {
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  },
};

export const supabase = isConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : (dummySupabase as unknown as ReturnType<typeof createClient>);
