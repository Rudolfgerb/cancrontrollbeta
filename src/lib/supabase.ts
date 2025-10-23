import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types
export interface PlayerProfile {
  id: string;
  user_id: string;
  username: string;
  money: number;
  reputation: number;
  level: number;
  experience: number;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface UserMetadata {
  username?: string;
  avatar_url?: string;
}
