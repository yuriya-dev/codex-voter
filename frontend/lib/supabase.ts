import { createClient } from "@supabase/supabase-js";

// Menggunakan nilai fallback langsung jika Vercel Env Variables tidak terinjeksi karena konfigurasi monorepo
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jntuusqycpkzssqypxyx.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_OVBwB7GFpa4xLWrAKs_zVg_kNVmaUEP";

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
    signInWithOAuth: () => {
      console.error("❌ ERROR: Supabase is not configured on this environment. Cannot perform signInWithOAuth.");
      alert("Konfigurasi Supabase (NEXT_PUBLIC_SUPABASE_URL & ANON_KEY) belum diset di Environment Variables Vercel!");
      return Promise.resolve({ data: { provider: "google", url: "" }, error: new Error("Supabase not configured") });
    },
    signOut: () => {
      console.error("❌ ERROR: Supabase is not configured on this environment. Cannot perform signOut.");
      return Promise.resolve({ error: null });
    }
  },
};

export const supabase = isConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : (dummySupabase as unknown as ReturnType<typeof createClient>);
