-- ==============================================================================
-- NOSE CREEK PHYSIOTHERAPY & REUSABLE CLINIC DASHBOARD - SUPABASE SQL SCHEMA
-- ==============================================================================
-- Idempotent & Re-runnable: Safe to execute multiple times in SQL Editor.
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create updated_at trigger helper
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- ==============================================================================
-- 3. SITE SETTINGS TABLE (Single record for clinic info, hours, SEO, marketing)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  clinic_name TEXT NOT NULL,
  logo_text TEXT,
  contact JSONB NOT NULL DEFAULT '{}'::jsonb,
  opening_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  booking_url TEXT,
  primary_cta TEXT DEFAULT 'Book Online',
  footer_content TEXT,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  marketing JSONB NOT NULL DEFAULT '{"callTracking": {"enabled": true, "scriptUrl": ""}, "gtm": {"enabled": false, "containerId": ""}}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_site_settings_modtime ON site_settings;
CREATE TRIGGER update_site_settings_modtime
BEFORE UPDATE ON site_settings
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- 4. SERVICES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  hero_image TEXT,
  side_image TEXT,
  icon_type TEXT,
  icon_bg TEXT,
  icon_color TEXT,
  cta_text TEXT DEFAULT 'Book Online',
  cta_muted BOOLEAN DEFAULT false,
  benefits JSONB DEFAULT '[]'::jsonb,
  symptoms JSONB DEFAULT '[]'::jsonb,
  treatment_approach JSONB DEFAULT '[]'::jsonb,
  custom_sections JSONB DEFAULT '[]'::jsonb,
  sections_data JSONB DEFAULT '{}'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  hidden_sections JSONB DEFAULT '[]'::jsonb,
  section_order JSONB DEFAULT '[]'::jsonb,
  related_services JSONB DEFAULT '[]'::jsonb,
  related_conditions JSONB DEFAULT '[]'::jsonb,
  team_members JSONB DEFAULT '[]'::jsonb,
  locations JSONB DEFAULT '[]'::jsonb,
  testimonials JSONB DEFAULT '[]'::jsonb,
  seo JSONB DEFAULT '{}'::jsonb,
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE services ADD COLUMN IF NOT EXISTS hidden_sections JSONB DEFAULT '[]'::jsonb;
ALTER TABLE services ADD COLUMN IF NOT EXISTS section_order JSONB DEFAULT '[]'::jsonb;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sections_data JSONB DEFAULT '{}'::jsonb;

DROP TRIGGER IF EXISTS update_services_modtime ON services;
CREATE TRIGGER update_services_modtime
BEFORE UPDATE ON services
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- 5. CONDITIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS conditions (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  hero_image TEXT,
  side_image TEXT,
  cta_text TEXT DEFAULT 'Book Assessment Online',
  cta_muted BOOLEAN DEFAULT false,
  benefits JSONB DEFAULT '[]'::jsonb,
  symptoms JSONB DEFAULT '[]'::jsonb,
  treatment_approach JSONB DEFAULT '[]'::jsonb,
  custom_sections JSONB DEFAULT '[]'::jsonb,
  sections_data JSONB DEFAULT '{}'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  hidden_sections JSONB DEFAULT '[]'::jsonb,
  section_order JSONB DEFAULT '[]'::jsonb,
  related_services JSONB DEFAULT '[]'::jsonb,
  category TEXT DEFAULT 'general',
  seo JSONB DEFAULT '{}'::jsonb,
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE conditions ADD COLUMN IF NOT EXISTS hidden_sections JSONB DEFAULT '[]'::jsonb;
ALTER TABLE conditions ADD COLUMN IF NOT EXISTS section_order JSONB DEFAULT '[]'::jsonb;
ALTER TABLE conditions ADD COLUMN IF NOT EXISTS sections_data JSONB DEFAULT '{}'::jsonb;

ALTER TABLE conditions ADD COLUMN IF NOT EXISTS side_image TEXT;
ALTER TABLE conditions ADD COLUMN IF NOT EXISTS cta_text TEXT DEFAULT 'Book Assessment Online';
ALTER TABLE conditions ADD COLUMN IF NOT EXISTS cta_muted BOOLEAN DEFAULT false;
ALTER TABLE conditions ADD COLUMN IF NOT EXISTS benefits JSONB DEFAULT '[]'::jsonb;
ALTER TABLE conditions ADD COLUMN IF NOT EXISTS custom_sections JSONB DEFAULT '[]'::jsonb;
ALTER TABLE conditions ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE conditions ADD COLUMN IF NOT EXISTS hidden_sections JSONB DEFAULT '[]'::jsonb;
ALTER TABLE conditions ADD COLUMN IF NOT EXISTS section_order JSONB DEFAULT '[]'::jsonb;

DROP TRIGGER IF EXISTS update_conditions_modtime ON conditions;
CREATE TRIGGER update_conditions_modtime
BEFORE UPDATE ON conditions
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- 6. TEAM MEMBERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  title TEXT,
  short_bio TEXT,
  full_bio TEXT,
  profile_image TEXT,
  specialties JSONB DEFAULT '[]'::jsonb,
  credentials JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  experience TEXT,
  locations JSONB DEFAULT '[]'::jsonb,
  services JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '[]'::jsonb,
  email TEXT,
  phone TEXT,
  booking_url TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  featured BOOLEAN DEFAULT false,
  is_director BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 99,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_team_members_modtime ON team_members;
CREATE TRIGGER update_team_members_modtime
BEFORE UPDATE ON team_members
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- 7. LOCATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  opening_hours JSONB DEFAULT '{}'::jsonb,
  map_embed_url TEXT,
  services JSONB DEFAULT '[]'::jsonb,
  team_members JSONB DEFAULT '[]'::jsonb,
  testimonials JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  booking_url TEXT,
  seo JSONB DEFAULT '{}'::jsonb,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_locations_modtime ON locations;
CREATE TRIGGER update_locations_modtime
BEFORE UPDATE ON locations
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- 8. BLOG POSTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  author TEXT,
  category TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  reading_time TEXT,
  related_posts JSONB DEFAULT '[]'::jsonb,
  seo JSONB DEFAULT '{}'::jsonb,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_blog_posts_modtime ON blog_posts;
CREATE TRIGGER update_blog_posts_modtime
BEFORE UPDATE ON blog_posts
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- 9. TESTIMONIALS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  rating NUMERIC(2,1) DEFAULT 5.0,
  platform TEXT DEFAULT 'Google',
  date TEXT,
  avatar TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_testimonials_modtime ON testimonials;
CREATE TRIGGER update_testimonials_modtime
BEFORE UPDATE ON testimonials
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- 10. FORM SUBMISSIONS / LEADS TABLE (Unified Inbox)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_type TEXT NOT NULL DEFAULT 'contact',
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  service_interest TEXT,
  message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  reply_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_submissions_email ON form_submissions(email);

DROP TRIGGER IF EXISTS update_form_submissions_modtime ON form_submissions;
CREATE TRIGGER update_form_submissions_modtime
BEFORE UPDATE ON form_submissions
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- 11.1 Full Access for Dashboard & Website
DROP POLICY IF EXISTS "Public can view and update settings" ON site_settings;
CREATE POLICY "Public can view and update settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view and update services" ON services;
CREATE POLICY "Public can view and update services" ON services FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view and update conditions" ON conditions;
CREATE POLICY "Public can view and update conditions" ON conditions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view and update team members" ON team_members;
CREATE POLICY "Public can view and update team members" ON team_members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view and update locations" ON locations;
CREATE POLICY "Public can view and update locations" ON locations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view and update blog posts" ON blog_posts;
CREATE POLICY "Public can view and update blog posts" ON blog_posts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view and update testimonials" ON testimonials;
CREATE POLICY "Public can view and update testimonials" ON testimonials FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view and manage form submissions" ON form_submissions;
CREATE POLICY "Public can view and manage form submissions" ON form_submissions FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 12. SUPABASE STORAGE BUCKET CONFIGURATION (MEDIA & UPLOADS)
-- ==============================================================================

-- Create public 'media' bucket for clinic images, blog images, and team photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for media bucket
DROP POLICY IF EXISTS "Public Media Access" ON storage.objects;
CREATE POLICY "Public Media Access" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Public Media Uploads" ON storage.objects;
CREATE POLICY "Public Media Uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Public Media Updates" ON storage.objects;
CREATE POLICY "Public Media Updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Public Media Deletes" ON storage.objects;
CREATE POLICY "Public Media Deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'media');

