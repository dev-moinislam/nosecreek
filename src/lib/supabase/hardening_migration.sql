-- ==============================================================================
-- NOSE CREEK PHYSIOTHERAPY - CRITICAL SECURITY HARDENING MIGRATION
-- Run this script in the Supabase SQL Editor to enforce strict RLS and protect
-- patient records, credentials, and content from unauthorized access.
-- ==============================================================================

-- 1. SECURE PATIENT FORM SUBMISSIONS (LEADS)
-- Public can ONLY INSERT inquiries. No public user can view, update, or delete patient leads.
ALTER TABLE IF EXISTS form_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view and manage form submissions" ON form_submissions;
DROP POLICY IF EXISTS "Public can submit inquiries" ON form_submissions;
CREATE POLICY "Public can submit inquiries" ON form_submissions 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage form submissions" ON form_submissions;
CREATE POLICY "Service role can manage form submissions" ON form_submissions 
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. LOCK DOWN USER CREDENTIALS (ADMIN & CLIENT ACCOUNTS)
-- Completely block public anon access. Only backend server (service_role) can access.
ALTER TABLE IF EXISTS admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS client_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow server read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow server update admin_users" ON admin_users;
DROP POLICY IF EXISTS "Service role can manage admin_users" ON admin_users;
CREATE POLICY "Service role can manage admin_users" ON admin_users 
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow server read client_users" ON client_users;
DROP POLICY IF EXISTS "Allow server update client_users" ON client_users;
DROP POLICY IF EXISTS "Service role can manage client_users" ON client_users;
CREATE POLICY "Service role can manage client_users" ON client_users 
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. SECURE SITE SETTINGS (PREVENT DEPLOYMENT DEFACEMENT)
-- Public can read clinic settings; only service_role can mutate settings.
ALTER TABLE IF EXISTS site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view and update settings" ON site_settings;
DROP POLICY IF EXISTS "Public can view settings" ON site_settings;
CREATE POLICY "Public can view settings" ON site_settings 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can manage settings" ON site_settings;
CREATE POLICY "Service role can manage settings" ON site_settings 
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. SECURE CONTENT TABLES (PUBLIC READ-ONLY, MUTATIONS VIA SERVICE ROLE)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['services', 'conditions', 'team_members', 'locations', 'blog_posts', 'testimonials', 'custom_pages'])
  LOOP
    EXECUTE format('ALTER TABLE IF EXISTS %I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS %L ON %I;', 'Public can view and update ' || tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %L ON %I;', 'Public can view ' || tbl, tbl);
    EXECUTE format('CREATE POLICY %L ON %I FOR SELECT USING (true);', 'Public can view ' || tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %L ON %I;', 'Service role can manage ' || tbl, tbl);
    EXECUTE format('CREATE POLICY %L ON %I FOR ALL TO service_role USING (true) WITH CHECK (true);', 'Service role can manage ' || tbl, tbl);
  END LOOP;
END $$;
