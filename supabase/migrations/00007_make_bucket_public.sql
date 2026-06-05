-- Make bucket public to simplify access
UPDATE storage.buckets SET public = true WHERE id = 'minhchung';
