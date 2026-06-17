
-- Restrict profile reads to owner; admins can view all
DROP POLICY IF EXISTS "Authenticated users view profiles" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Hide reviews.user_id from anonymous visitors (keep authenticated access for own-review queries)
REVOKE SELECT (user_id) ON public.reviews FROM anon;
