-- Semesters table
CREATE TABLE semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one semester can be active at a time
CREATE UNIQUE INDEX idx_semesters_active ON semesters(is_active) WHERE is_active = true;

-- Add semester_id to activities (nullable for backward compatibility)
ALTER TABLE activities ADD COLUMN semester_id UUID REFERENCES semesters(id) ON DELETE SET NULL;
CREATE INDEX idx_activities_semester_id ON activities(semester_id);

-- Add semester_id to submissions
ALTER TABLE submissions ADD COLUMN semester_id UUID REFERENCES semesters(id) ON DELETE SET NULL;
CREATE INDEX idx_submissions_semester_id ON submissions(semester_id);

-- RLS
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view semesters"
  ON semesters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert semesters"
  ON semesters FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update semesters"
  ON semesters FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete semesters"
  ON semesters FOR DELETE
  USING (is_admin());

-- Update existing activities policies to include semester_id access
CREATE POLICY "Admins can update activities (extended)"
  ON activities FOR UPDATE
  USING (is_admin());
