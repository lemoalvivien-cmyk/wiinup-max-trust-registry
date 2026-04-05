
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- TABLE: profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('entreprise', 'facilitateur', 'admin')),
  company_name TEXT,
  siren TEXT,
  sector TEXT,
  city TEXT,
  phone TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  subscription_status TEXT CHECK (subscription_status IN ('none','active','past_due','canceled')) DEFAULT 'none',
  subscription_plan TEXT CHECK (subscription_plan IN ('starter','pro','performance')) DEFAULT 'starter',
  reputation_score INTEGER DEFAULT 100 CHECK (reputation_score >= 0 AND reputation_score <= 1000),
  is_founder BOOLEAN DEFAULT false,
  qr_code_token UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'role', 'entreprise'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- TABLE: user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.get_profile_role(_user_id UUID)
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.profiles WHERE id = _user_id $$;

-- TABLE: besoins
CREATE TABLE public.besoins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entreprise_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 120),
  description TEXT NOT NULL CHECK (char_length(description) <= 500),
  sector_target TEXT NOT NULL,
  budget_range TEXT CHECK (budget_range IN ('< 5k','5-20k','20-50k','50-100k','> 100k')),
  status TEXT CHECK (status IN ('active','paused','closed')) DEFAULT 'active',
  is_phantom BOOLEAN DEFAULT false,
  ai_source TEXT,
  ai_confidence_score INTEGER CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.besoins ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_besoins_updated_at BEFORE UPDATE ON public.besoins FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TABLE: introductions
CREATE TABLE public.introductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  besoin_id UUID NOT NULL REFERENCES public.besoins(id) ON DELETE CASCADE,
  facilitateur_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prospect_name TEXT NOT NULL,
  prospect_company TEXT NOT NULL,
  prospect_email TEXT,
  prospect_phone TEXT,
  status TEXT CHECK (status IN ('draft','pending','accepted','meeting_scheduled','won','lost','rejected')) DEFAULT 'draft',
  proof_count INTEGER DEFAULT 0,
  deal_amount NUMERIC,
  commission_amount NUMERIC,
  entreprise_confirmed BOOLEAN DEFAULT false,
  facilitateur_confirmed BOOLEAN DEFAULT false,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.introductions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_introductions_updated_at BEFORE UPDATE ON public.introductions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TABLE: preuves
CREATE TABLE public.preuves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  introduction_id UUID NOT NULL REFERENCES public.introductions(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('token_click','calendar_rdv','form_accept','bilateral_confirm','docusign','rdv_declare','invoice','email_forward','screenshot','click_no_activation','email_open','temporal_coherence')) NOT NULL,
  level TEXT CHECK (level IN ('forte','moyenne','faible','suspecte')) NOT NULL,
  points INTEGER NOT NULL,
  file_url TEXT,
  sha256_hash TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.preuves ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_preuves_updated_at BEFORE UPDATE ON public.preuves FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TABLE: audit_trail
CREATE TABLE public.audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  actor_id UUID REFERENCES public.profiles(id),
  sha256_hash TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_audit_trail_updated_at BEFORE UPDATE ON public.audit_trail FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TABLE: ai_prospects
CREATE TABLE public.ai_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entreprise_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  siren TEXT,
  contact_name TEXT,
  contact_email TEXT,
  source TEXT CHECK (source IN ('bodacc','pappers','insee','press','job_boards')),
  signal_type TEXT,
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
  ai_justification TEXT,
  suggested_message TEXT,
  status TEXT CHECK (status IN ('new','validated','sent','responded','dismissed')) DEFAULT 'new',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ai_prospects ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_ai_prospects_updated_at BEFORE UPDATE ON public.ai_prospects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TABLE: commissions
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  introduction_id UUID NOT NULL UNIQUE REFERENCES public.introductions(id) ON DELETE CASCADE,
  facilitateur_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('pending','paid','disputed')) DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON public.commissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TABLE: fraud_flags
CREATE TABLE public.fraud_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flagged_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  flag_type TEXT CHECK (flag_type IN ('fake_lead','self_attribution','non_declaration','amount_reduction','off_platform','collusion','doc_falsification')) NOT NULL,
  severity TEXT CHECK (severity IN ('low','medium','high','critical')) NOT NULL,
  evidence JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.fraud_flags ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_fraud_flags_updated_at BEFORE UPDATE ON public.fraud_flags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- STATE MACHINE
CREATE OR REPLACE FUNCTION public.transition_introduction_status(intro_id UUID, new_status TEXT, actor_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  current_status TEXT; current_proof_count INTEGER;
  current_e_confirmed BOOLEAN; current_f_confirmed BOOLEAN;
  hash_input TEXT; computed_hash TEXT;
BEGIN
  SELECT status, proof_count, entreprise_confirmed, facilitateur_confirmed
  INTO current_status, current_proof_count, current_e_confirmed, current_f_confirmed
  FROM public.introductions WHERE id = intro_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Introduction % not found', intro_id; END IF;

  IF new_status = 'rejected' THEN NULL;
  ELSIF current_status = 'draft' AND new_status = 'pending' THEN NULL;
  ELSIF current_status = 'pending' AND new_status IN ('accepted', 'rejected') THEN NULL;
  ELSIF current_status = 'accepted' AND new_status = 'meeting_scheduled' THEN
    IF current_proof_count < 1 THEN RAISE EXCEPTION 'At least 1 proof required'; END IF;
  ELSIF current_status = 'meeting_scheduled' AND new_status IN ('won', 'lost') THEN
    IF new_status = 'won' AND NOT (current_e_confirmed AND current_f_confirmed) THEN
      RAISE EXCEPTION 'Both parties must confirm for WON';
    END IF;
  ELSE RAISE EXCEPTION 'Invalid transition from % to %', current_status, new_status;
  END IF;

  hash_input := intro_id::text || current_status || new_status || actor_id::text || now()::text;
  computed_hash := encode(sha256(hash_input::bytea), 'hex');
  UPDATE public.introductions SET status = new_status, updated_at = now() WHERE id = intro_id;
  INSERT INTO public.audit_trail (entity_type, entity_id, action, old_value, new_value, actor_id, sha256_hash)
  VALUES ('introduction', intro_id, 'status_change', jsonb_build_object('status', current_status), jsonb_build_object('status', new_status), actor_id, computed_hash);
END; $$;

-- RLS POLICIES
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Entreprises can view own besoins" ON public.besoins FOR SELECT USING (auth.uid() = entreprise_id);
CREATE POLICY "Facilitateurs can view active besoins" ON public.besoins FOR SELECT USING (public.get_profile_role(auth.uid()) = 'facilitateur' AND status = 'active');
CREATE POLICY "Admin can view all besoins" ON public.besoins FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Entreprises can create besoins" ON public.besoins FOR INSERT WITH CHECK (auth.uid() = entreprise_id);
CREATE POLICY "Entreprises can update own besoins" ON public.besoins FOR UPDATE USING (auth.uid() = entreprise_id);
CREATE POLICY "Facilitateurs can view own introductions" ON public.introductions FOR SELECT USING (auth.uid() = facilitateur_id);
CREATE POLICY "Entreprises can view intros for their besoins" ON public.introductions FOR SELECT USING (EXISTS (SELECT 1 FROM public.besoins WHERE besoins.id = introductions.besoin_id AND besoins.entreprise_id = auth.uid()));
CREATE POLICY "Admin can view all introductions" ON public.introductions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Facilitateurs can create introductions" ON public.introductions FOR INSERT WITH CHECK (auth.uid() = facilitateur_id);
CREATE POLICY "Parties can update introductions" ON public.introductions FOR UPDATE USING (auth.uid() = facilitateur_id OR EXISTS (SELECT 1 FROM public.besoins WHERE besoins.id = introductions.besoin_id AND besoins.entreprise_id = auth.uid()));
CREATE POLICY "Parties can view preuves" ON public.preuves FOR SELECT USING (EXISTS (SELECT 1 FROM public.introductions i WHERE i.id = preuves.introduction_id AND (i.facilitateur_id = auth.uid() OR EXISTS (SELECT 1 FROM public.besoins b WHERE b.id = i.besoin_id AND b.entreprise_id = auth.uid()))));
CREATE POLICY "Parties can insert preuves" ON public.preuves FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.introductions i WHERE i.id = preuves.introduction_id AND (i.facilitateur_id = auth.uid() OR EXISTS (SELECT 1 FROM public.besoins b WHERE b.id = i.besoin_id AND b.entreprise_id = auth.uid()))));
CREATE POLICY "View related audit trail" ON public.audit_trail FOR SELECT USING (actor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Entreprises can view own ai_prospects" ON public.ai_prospects FOR SELECT USING (auth.uid() = entreprise_id);
CREATE POLICY "Admin can view all ai_prospects" ON public.ai_prospects FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Entreprises can update own ai_prospects" ON public.ai_prospects FOR UPDATE USING (auth.uid() = entreprise_id);
CREATE POLICY "Facilitateurs can view own commissions" ON public.commissions FOR SELECT USING (auth.uid() = facilitateur_id);
CREATE POLICY "Admin can view all commissions" ON public.commissions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can view fraud_flags" ON public.fraud_flags FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can insert fraud_flags" ON public.fraud_flags FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can update fraud_flags" ON public.fraud_flags FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Masked view
CREATE OR REPLACE VIEW public.introductions_safe AS
SELECT id, besoin_id, facilitateur_id, prospect_name, prospect_company,
  CASE WHEN status IN ('accepted','meeting_scheduled','won') THEN prospect_email ELSE NULL END AS prospect_email,
  CASE WHEN status IN ('accepted','meeting_scheduled','won') THEN prospect_phone ELSE NULL END AS prospect_phone,
  status, proof_count, deal_amount, commission_amount, entreprise_confirmed, facilitateur_confirmed, rejection_reason, created_at, updated_at
FROM public.introductions;
