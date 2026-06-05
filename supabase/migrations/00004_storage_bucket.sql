-- Create storage bucket for minh chung files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'minhchung',
  'minhchung',
  false,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage.objects
CREATE POLICY "Users can view own files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'minhchung' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'minhchung' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'minhchung' AND is_admin());

-- Allow admins to view/delete any file in bucket
CREATE POLICY "Admins can delete files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'minhchung' AND is_admin());
