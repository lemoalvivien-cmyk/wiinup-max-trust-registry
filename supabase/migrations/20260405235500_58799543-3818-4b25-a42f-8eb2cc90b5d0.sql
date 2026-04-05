
-- Table for Stripe webhook logging
CREATE TABLE public.stripe_webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_id text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'processed',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view stripe logs"
ON public.stripe_webhook_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Add referred_by to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.profiles(id);

-- Storage bucket for proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('proofs', 'proofs', false);

CREATE POLICY "Authenticated users can upload proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'proofs');

CREATE POLICY "Users can view proofs for their introductions"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'proofs');
