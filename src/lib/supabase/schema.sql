-- ==============================================================================
-- NOSE CREEK PHYSIOTHERAPY & REUSABLE CLINIC DASHBOARD - SUPABASE SQL SCHEMA
-- ==============================================================================
-- Run this script in your Supabase SQL Editor to set up all required tables,
-- Row-Level Security (RLS) policies, and trigger functions.
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
  faqs JSONB DEFAULT '[]'::jsonb,
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
  symptoms JSONB DEFAULT '[]'::jsonb,
  treatment_approach JSONB DEFAULT '[]'::jsonb,
  related_services JSONB DEFAULT '[]'::jsonb,
  category TEXT DEFAULT 'general',
  seo JSONB DEFAULT '{}'::jsonb,
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TRIGGER update_testimonials_modtime
BEFORE UPDATE ON testimonials
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- 10. FORM SUBMISSIONS / LEADS TABLE (Unified Inbox)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_type TEXT NOT NULL DEFAULT 'contact', -- 'contact', 'appointment', 'workshop_registration', 'workshop_replay', 'discovery_call', 'general'
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  service_interest TEXT,
  message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- UTM tags, page URL, device info
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'in_progress', 'replied', 'converted', 'archived'
  notes TEXT,
  reply_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_submissions_email ON form_submissions(email);

CREATE TRIGGER update_form_submissions_modtime
BEFORE UPDATE ON form_submissions
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- 11. USER PROFILES / RBAC (Admin vs Client)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client', -- 'admin' or 'client'
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 12.1 Public Read for Published Content
CREATE POLICY "Public can view site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public can view published services" ON services FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published conditions" ON conditions FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published team members" ON team_members FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published locations" ON locations FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published blog posts" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published testimonials" ON testimonials FOR SELECT USING (is_published = true);

-- 12.2 Public Insert for Form Submissions (Leads)
CREATE POLICY "Public visitors can submit forms" ON form_submissions FOR INSERT WITH CHECK (true);

-- 12.3 Authenticated Users Full/Managed Access
CREATE POLICY "Authenticated users can manage settings" ON site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage services" ON services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage conditions" ON conditions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage team members" ON team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage locations" ON locations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage blog posts" ON blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage testimonials" ON testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage form submissions" ON form_submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Users can view and manage their own profile" ON user_profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ==============================================================================
-- Schema Setup Complete!
-- ==============================================================================
