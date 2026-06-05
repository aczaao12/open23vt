-- Migrate old schema (drive_enabled/supabase_enabled) to new (storage_backend)
ALTER TABLE storage_config ADD COLUMN IF NOT EXISTS storage_backend TEXT;

UPDATE storage_config
SET storage_backend = CASE WHEN drive_enabled THEN 'drive' ELSE 'supabase' END;

ALTER TABLE storage_config ALTER COLUMN storage_backend SET NOT NULL;
ALTER TABLE storage_config ADD CONSTRAINT storage_config_storage_backend_check
  CHECK (storage_backend IN ('drive', 'supabase'));

ALTER TABLE storage_config DROP COLUMN IF EXISTS drive_enabled;
ALTER TABLE storage_config DROP COLUMN IF EXISTS supabase_enabled;

-- Update RLS: drop old policies, recreate
DROP POLICY IF EXISTS "Admins can update storage config" ON storage_config;

CREATE POLICY "Admins can update storage config"
  ON storage_config FOR UPDATE
  USING (true)
  WITH CHECK (is_admin());

CREATE POLICY "Admins can insert storage config"
  ON storage_config FOR INSERT
  WITH CHECK (is_admin());

-- Update submissions storage_type check (remove 'both')
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_storage_type_check;
ALTER TABLE submissions ADD CONSTRAINT submissions_storage_type_check
  CHECK (storage_type IN ('drive', 'supabase'));
