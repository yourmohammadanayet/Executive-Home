/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const getValidUrl = (url: string | undefined) => {
  if (!url) return 'https://placeholder.supabase.co';
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'https://placeholder.supabase.co';
    }
    return url;
  } catch {
    return 'https://placeholder.supabase.co';
  }
};

const supabaseUrl = getValidUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY' ? import.meta.env.VITE_SUPABASE_ANON_KEY : 'placeholder';

export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey, 
  {
    auth: {
      persistSession: true,
    },
  }
);

export const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url !== undefined && url !== '' && url !== 'YOUR_SUPABASE_URL' && 
         key !== undefined && key !== '' && key !== 'YOUR_SUPABASE_ANON_KEY';
};
