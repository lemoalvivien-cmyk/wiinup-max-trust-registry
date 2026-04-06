import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  role: string;
  company_name: string | null;
  siren: string | null;
  sector: string | null;
  city: string | null;
  phone: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean | null;
  stripe_customer_id: string | null;
  subscription_status: string | null;
  subscription_plan: string | null;
  reputation_score: number | null;
  is_founder: boolean | null;
  qr_code_token: string | null;
  referred_by: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile(data as Profile | null);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, profile, loading, setProfile };
}
