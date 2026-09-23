import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'paste-your-supabase-anon-public-key-here').trim();

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'paste-your-supabase-anon-public-key-here' ||
  supabaseUrl.includes('placeholder')
) {
  console.warn(
    'Supabase URL or Anon Key is missing or default. Authentication will fail. Please configure your .env.local file.'
  );
}

// Define a unique storage key per tab to prevent BroadcastChannel from syncing auth events across tabs
// when multiple roles/accounts (e.g. admin and vendor) are logged in simultaneously in different tabs.
let storageKey: string | undefined = undefined;
if (typeof window !== 'undefined') {
  let tabId = window.sessionStorage.getItem('urservice_tab_id');
  if (!tabId) {
    tabId = Math.random().toString(36).substring(2, 15);
    window.sessionStorage.setItem('urservice_tab_id', tabId);
  }
  storageKey = `urservice-auth-${tabId}`;
}

// Single supabase-js client instance.
// WARNING: This client MUST ONLY be used for auth-related operations (supabase.auth.*).
// Do NOT query tables directly (e.g., supabase.from()) or access storage (e.g., supabase.storage).
// All database and storage operations must route through the FastAPI backend.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
    persistSession: true,
    storageKey,
  },
});
