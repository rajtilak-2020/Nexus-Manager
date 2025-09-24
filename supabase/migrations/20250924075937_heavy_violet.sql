/*
  # Blog CMS Database Schema

  1. New Tables
    - `users` - User accounts with authentication
    - `user_api_keys` - API keys for external integration  
    - `blogs` - Blog posts with metadata
    - `media` - Media files and images
    - `blog_tags` - Tags for blog categorization

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - API key authentication for external access

  3. Features
    - Blog status management (draft, published, inactive)
    - SEO metadata support
    - Media management with file uploads
    - Tag system for categorization
    - Reading time calculation
    - Automatic slug generation
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  bio text DEFAULT '',
  avatar_url text DEFAULT '',
  website text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User API Keys for external integration
CREATE TABLE IF NOT EXISTS user_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  api_key text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  name text NOT NULL DEFAULT 'Default API Key',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz DEFAULT NULL
);

-- Media/Images table
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  original_name text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  url text NOT NULL,
  alt_text text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  summary text DEFAULT '',
  content text DEFAULT '',
  featured_image_id uuid REFERENCES media(id) ON DELETE SET NULL,
  featured_image_url text DEFAULT '',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'inactive')),
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  reading_time integer DEFAULT 0,
  published_at timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, slug)
);

-- Blog tags table
CREATE TABLE IF NOT EXISTS blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, slug)
);

-- Blog post tags junction table
CREATE TABLE IF NOT EXISTS blog_post_tags (
  blog_id uuid NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- API Keys policies
CREATE POLICY "Users can manage own API keys"
  ON user_api_keys
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Media policies
CREATE POLICY "Users can manage own media"
  ON media
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Blogs policies
CREATE POLICY "Users can manage own blogs"
  ON blogs
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Public read access for published blogs (for API)
CREATE POLICY "Public can read published blogs"
  ON blogs
  FOR SELECT
  TO anon
  USING (status = 'published');

-- Blog tags policies
CREATE POLICY "Users can manage own tags"
  ON blog_tags
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Blog post tags policies  
CREATE POLICY "Users can manage own blog post tags"
  ON blog_post_tags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM blogs 
      WHERE blogs.id = blog_post_tags.blog_id 
      AND blogs.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blogs_user_id ON blogs(user_id);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON blogs(published_at);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_tags_user_id ON blog_tags(user_id);

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at
    BEFORE UPDATE ON blogs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();