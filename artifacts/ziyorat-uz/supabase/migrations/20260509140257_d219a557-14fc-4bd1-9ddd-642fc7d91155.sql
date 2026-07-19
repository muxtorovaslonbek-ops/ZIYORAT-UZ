
-- 1. Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;

CREATE POLICY "users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admins view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- 2. Subscriptions
CREATE TYPE public.sub_plan AS ENUM ('1m','3m','12m');
CREATE TYPE public.sub_source AS ENUM ('stripe','manual');
CREATE TYPE public.sub_status AS ENUM ('active','expired','canceled');

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan sub_plan NOT NULL,
  source sub_source NOT NULL,
  status sub_status NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  stripe_session_id TEXT,
  payment_request_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_subs_user ON public.subscriptions(user_id, status);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own subs" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admins view all subs" ON public.subscriptions FOR SELECT USING (public.has_role(auth.uid(),'admin'));
-- INSERT/UPDATE/DELETE only via service role (edge functions)

CREATE TRIGGER subs_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Payment requests (manual)
CREATE TYPE public.pay_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.pay_method AS ENUM ('click','payme','card','other');

CREATE TABLE public.payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan sub_plan NOT NULL,
  amount_uzs INTEGER NOT NULL,
  payment_method pay_method NOT NULL,
  receipt_url TEXT NOT NULL,
  user_note TEXT,
  status pay_status NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pr_status ON public.payment_requests(status, created_at DESC);
CREATE INDEX idx_pr_user ON public.payment_requests(user_id);
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own requests" ON public.payment_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own requests" ON public.payment_requests FOR INSERT WITH CHECK (auth.uid() = user_id AND status='pending');
CREATE POLICY "admins view all requests" ON public.payment_requests FOR SELECT USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update requests" ON public.payment_requests FOR UPDATE USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER pr_updated_at BEFORE UPDATE ON public.payment_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Payment settings (single row, public read, admin write)
CREATE TABLE public.payment_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  card_number TEXT,
  card_holder TEXT,
  click_phone TEXT,
  click_id TEXT,
  payme_phone TEXT,
  payme_id TEXT,
  instructions TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.payment_settings (id, card_number, card_holder, click_phone, payme_phone, instructions)
VALUES (1, '8600 0000 0000 0000', 'ZIYORAT UZ', '+998 90 000 00 00', '+998 90 000 00 00',
  'To''lovni amalga oshirgach, chekni (screenshot) yuklang. Admin 24 soat ichida tasdiqlaydi.');
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view settings" ON public.payment_settings FOR SELECT USING (true);
CREATE POLICY "admins update settings" ON public.payment_settings FOR UPDATE USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER ps_updated_at BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Storage bucket for receipts (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-receipts', 'payment-receipts', false);

CREATE POLICY "users upload own receipts" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "users read own receipts" ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "admins read all receipts" ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-receipts' AND public.has_role(auth.uid(),'admin'));

-- 6. Helper: get current active subscription
CREATE OR REPLACE FUNCTION public.get_active_subscription(_user_id uuid)
RETURNS TABLE(id uuid, plan sub_plan, source sub_source, started_at timestamptz, expires_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, plan, source, started_at, expires_at FROM public.subscriptions
  WHERE user_id = _user_id AND status='active' AND expires_at > now()
  ORDER BY expires_at DESC LIMIT 1
$$;
