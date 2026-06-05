-- Allow authenticated users to see the bucket
CREATE POLICY "Anyone can view minhchung bucket"
  ON storage.buckets FOR SELECT
  TO authenticated
  USING (id = 'minhchung');

-- Drop and recreate object policies with correct checks
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete files" ON storage.objects;

CREATE POLICY "Users can view own files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'minhchung' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'minhchung' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'minhchung' AND is_admin());

CREATE POLICY "Admins can delete files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'minhchung' AND is_admin());
