
-- Drop overly broad SELECT on storage and replace with owner-only listing (public read still works via direct URL)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

CREATE POLICY "Users can view own avatar files"
  ON storage.objects FOR SELECT USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- search_path is already set in our functions; nothing else needed
