
-- 1. contract_applications: admin-only SELECT
CREATE POLICY "admins view contract applications"
ON public.contract_applications FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. payment_settings: authenticated only
DROP POLICY IF EXISTS "anyone view settings" ON public.payment_settings;
CREATE POLICY "authenticated view settings"
ON public.payment_settings FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 3. profiles: authenticated only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- 4. certificates bucket: require auth + folder ownership for uploads
DROP POLICY IF EXISTS "Anyone can upload certificate" ON storage.objects;
CREATE POLICY "Auth users upload own certificate"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'certificates'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Public read for certificates remains (publicly displayable). To prevent
-- listing the whole bucket, replace broad SELECT with the same predicate
-- (object-by-object access still works via direct URL/path).
-- Keep existing public read for certificates since they're displayed on the site.

-- 5. Revoke SECURITY DEFINER function execution from anon (RLS still works
-- because policies invoke the function in the planner context).
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_active_subscription(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_active_subscription(uuid) TO authenticated, service_role;
