-- Storage buckets (Firebase Storage replacement)

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('service-avatars', 'service-avatars', true),
  ('event-images', 'event-images', true),
  ('pdfs', 'pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Permissive storage policies
CREATE POLICY "anon_avatars_all" ON storage.objects FOR ALL TO anon, authenticated
  USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "anon_service_avatars_all" ON storage.objects FOR ALL TO anon, authenticated
  USING (bucket_id = 'service-avatars') WITH CHECK (bucket_id = 'service-avatars');

CREATE POLICY "anon_event_images_all" ON storage.objects FOR ALL TO anon, authenticated
  USING (bucket_id = 'event-images') WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "anon_pdfs_all" ON storage.objects FOR ALL TO anon, authenticated
  USING (bucket_id = 'pdfs') WITH CHECK (bucket_id = 'pdfs');
