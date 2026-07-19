
-- Application type enum
CREATE TYPE public.contract_applicant_type AS ENUM ('guide', 'hotel', 'restaurant');
CREATE TYPE public.contract_application_status AS ENUM ('new', 'reviewing', 'approved', 'rejected');

-- Contract applications table
CREATE TABLE public.contract_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  applicant_type public.contract_applicant_type NOT NULL,
  full_name TEXT NOT NULL,
  organization_name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  region TEXT,
  address TEXT,
  certificate_number TEXT,
  certificate_file_url TEXT,
  message TEXT,
  status public.contract_application_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contract_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application (including unauthenticated)
CREATE POLICY "Anyone can submit contract applications"
ON public.contract_applications
FOR INSERT
WITH CHECK (true);

-- Updated-at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_contract_applications_updated_at
BEFORE UPDATE ON public.contract_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for certificates (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read certificates
CREATE POLICY "Certificates are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'certificates');

-- Anyone can upload certificate (along with application)
CREATE POLICY "Anyone can upload certificate"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'certificates');
