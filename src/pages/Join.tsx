import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TitanButton from "@/components/titan/TitanButton";
import TitanInput from "@/components/titan/TitanInput";
import TitanCard from "@/components/titan/TitanCard";
import TitanFooter from "@/components/titan/TitanFooter";
import { Users, Mail, Lock, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Join = () => {
  const [searchParams] = useSearchParams();
  const refToken = searchParams.get("ref") || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: "facilitateur", ref_token: refToken },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      toast({
        title: "Inscription réussie !",
        description: "Vérifiez votre email pour confirmer votre compte.",
      });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-4 px-4">
        <Link to="/" className="flex items-center gap-2 max-w-6xl mx-auto">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-sm">W</span>
          </div>
          <span className="text-lg font-bold text-foreground">WIINUP MAX</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Devenez facilitateur</h1>
            <p className="text-muted-foreground mt-2">Gratuit à vie. Monétisez votre réseau.</p>
          </div>

          {refToken && (
            <TitanCard variant="outlined" padding="p-3">
              <div className="flex items-center gap-2 text-sm">
                <Gift className="h-4 w-4 text-accent" />
                <span className="text-foreground">Vous avez été invité par un facilitateur du réseau !</span>
              </div>
            </TitanCard>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <TitanInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com" icon={<Mail className="h-4 w-4" />} required />
            <TitanInput label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" icon={<Lock className="h-4 w-4" />} required />
            <TitanButton type="submit" loading={loading} className="w-full">
              S'inscrire gratuitement
            </TitanButton>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Déjà un compte ? <Link to="/auth?mode=login" className="text-accent font-medium">Se connecter</Link>
          </p>
        </div>
      </div>
      <TitanFooter />
    </div>
  );
};

export default Join;
