/*
 * Indsæt kun Supabase project URL og anon key her.
 * Anon key må gerne ligge i frontend; service_role key må aldrig gøre det.
 */
window.MI_SUPABASE_URL = "";
window.MI_SUPABASE_ANON_KEY = "";

if (window.supabase && window.MI_SUPABASE_URL && window.MI_SUPABASE_ANON_KEY) {
  window.supabaseClient = window.supabase.createClient(
    window.MI_SUPABASE_URL,
    window.MI_SUPABASE_ANON_KEY,
  );
}
