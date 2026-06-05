-- Storage config (singleton: only one row)
CREATE TABLE storage_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_backend TEXT NOT NULL DEFAULT 'drive'
    CHECK (storage_backend IN ('drive', 'supabase')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Insert default row
INSERT INTO storage_config (storage_backend)
VALUES ('drive');

-- RLS
ALTER TABLE storage_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view storage config"
  ON storage_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update storage config"
  ON storage_config FOR UPDATE
  USING (true)
  WITH CHECK (is_admin());

CREATE POLICY "Admins can insert storage config"
  ON storage_config FOR INSERT
  WITH CHECK (is_admin());

-- Add storage_type and supabase_path to submissions
ALTER TABLE submissions ADD COLUMN storage_type TEXT NOT NULL DEFAULT 'drive'
  CHECK (storage_type IN ('drive', 'supabase'));

ALTER TABLE submissions ADD COLUMN supabase_path TEXT;
