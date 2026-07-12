const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("your-project") || supabaseKey.includes("your-anon-public-key")) {
  console.warn("⚠️ WARNING: Supabase URL or Anon Key is missing or using default placeholders in .env! Backend operations will fail.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
