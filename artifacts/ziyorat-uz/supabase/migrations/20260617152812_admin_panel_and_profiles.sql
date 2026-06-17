-- Add telegram + email + phone columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update profiles RLS: admins can view + update all
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update all profiles" ON public.profiles;
CREATE POLICY "Admins update all profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Update handle_new_user to capture email + telegram info from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, telegram_id, telegram_username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'telegram_id',
    NEW.raw_user_meta_data->>'telegram_username'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    telegram_id = COALESCE(EXCLUDED.telegram_id, public.profiles.telegram_id),
    telegram_username = COALESCE(EXCLUDED.telegram_username, public.profiles.telegram_username),
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Admin can view ALL bookings
DROP POLICY IF EXISTS "Admins view all bookings" ON public.bookings;
CREATE POLICY "Admins view all bookings" ON public.bookings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view ALL reviews (reviews already public, this just documents intent)
-- Admin can view ALL subscriptions (already has policy in previous migration)

-- Allow users to update their own profile email/telegram
DROP POLICY IF EXISTS "Users update own profile extended" ON public.profiles;
CREATE POLICY "Users update own profile extended" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
