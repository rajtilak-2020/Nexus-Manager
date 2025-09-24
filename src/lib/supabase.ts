import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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