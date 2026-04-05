
DROP VIEW IF EXISTS public.introductions_safe;
CREATE OR REPLACE VIEW public.introductions_safe
WITH (security_invoker = true) AS
SELECT id, besoin_id, facilitateur_id, prospect_name, prospect_company,
  CASE WHEN status IN ('accepted','meeting_scheduled','won') THEN prospect_email ELSE NULL END AS prospect_email,
  CASE WHEN status IN ('accepted','meeting_scheduled','won') THEN prospect_phone ELSE NULL END AS prospect_phone,
  status, proof_count, deal_amount, commission_amount, entreprise_confirmed, facilitateur_confirmed, rejection_reason, created_at, updated_at
FROM public.introductions;
