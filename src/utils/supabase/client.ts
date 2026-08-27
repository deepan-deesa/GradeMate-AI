import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_URL || process.env?.NEXT_PUBLIC_SUPABASE_URL || process.env?.SUPABASE_URL)) ||
  'https://frxxudsztexkgtmdbuea.supabase.co';

const SUPABASE_KEY =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_PUBLISHABLE_KEY || process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env?.SUPABASE_PUBLISHABLE_KEY)) ||
  'sb_publishable_ljn2hydrAqeQe2G1iZweKQ_fXU0JWxP';

let clientInstance: SupabaseClient | null = null;

export const createClient = (): SupabaseClient => {
  if (!clientInstance) {
    clientInstance = createSupabaseClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return clientInstance;
};

export const supabase = createClient();
