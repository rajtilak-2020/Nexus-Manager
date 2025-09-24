import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const SUPABASE_CONFIG_MISSING = !supabaseUrl || !supabaseAnonKey;

// Create a minimal mock client to keep the UI functional when env is missing.
// All DB operations will be no-ops that return null data and a helpful error.
function createMockSupabaseClient() {
  const notConfiguredError = new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');

  const tableBuilder = {
    select: () => tableBuilder,
    insert: () => Promise.resolve({ data: null, error: notConfiguredError }),
    update: () => Promise.resolve({ data: null, error: notConfiguredError }),
    eq: () => tableBuilder,
    single: () => Promise.resolve({ data: null, error: notConfiguredError }),
  } as any;

  const client = {
    auth: {
      async getSession() {
        return { data: { session: null }, error: null };
      },
      onAuthStateChange(_cb: any) {
        return { data: { subscription: { unsubscribe() {} } } } as any;
      },
      async signInWithPassword() {
        return { data: { user: null, session: null }, error: notConfiguredError } as any;
      },
      async signUp() {
        return { data: { user: null, session: null }, error: notConfiguredError } as any;
      },
      async signOut() {
        return { error: null } as any;
      },
    },
    from() {
      return tableBuilder;
    },
  };

  return client;
}

export const supabase: any = SUPABASE_CONFIG_MISSING
  ? createMockSupabaseClient()
  : createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  api_key: string;
  name: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

export interface Media {
  id: string;
  user_id: string;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  url: string;
  alt_text?: string;
  created_at: string;
}

export interface BlogTag {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  color: string;
  created_at: string;
}

export interface Blog {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  featured_image_id?: string;
  featured_image_url?: string;
  status: 'draft' | 'published' | 'inactive';
  seo_title?: string;
  seo_description?: string;
  reading_time: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  tags?: BlogTag[];
}