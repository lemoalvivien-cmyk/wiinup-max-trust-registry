import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TitanButton from "@/components/titan/TitanButton";
import TitanInput from "@/components/titan/TitanInput";
import TitanCard from "@/components/titan/TitanCard";
import TitanFooter from "@/components/titan/TitanFooter";
import { Building2, Users, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(
    searchParams.get("mode") === "login" ? "login" : "register"
  );
  const [role, setRole] = useState<"entreprise" | "facilitateur">(
    (searchParams.get("role") as "entreprise" | "facilitateur") || "entreprise"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { redirectToCheckout } = useStripeCheckout();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;

        if (role === "entreprise") {
          const acTk = signUpData?.session?.access_token;
          if (!acTk) {
            toast({
              title: "Email de confirmation envoyé",
              description:
                "Vérifiez votre boîte mail, confirmez votre compte, puis connectez-vous pour finaliser le paiement.",
            });
            setLoading(false);
            return;
          }
          await redirectToCheckout({
            priceId: "price_1TISUWEG497aCUFxCf50zKPZ",
            email,
            accessToken: acTk,
          });
          return;
        } else {
          toast({
            title: "Bienvenue !",
            description: "Votre compte facilitateur est prêt.",
          });
          navigate("/dashboard");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        const redirectTo = searchParams.get("redirect") || "/dashboard";
        navigate(redirectTo);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
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
          <span className="text-lg font-bold text-foreground">WIINUP</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === "login"
                  ? "bg-card text-foreground titan-shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === "register"
                  ? "bg-card text-foreground titan-shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Inscription
            </button>
          </div>

          {mode === "register" && (
            <div className="grid grid-cols-2 gap-3">
              <TitanCard
                variant={role === "entreprise" ? "elevated" : "outlined"}
                className={`cursor-pointer text-center transition-all ${
                  role === "entreprise" ? "ring-2 ring-accent" : ""
                }`}
                padding="p-4"
              >
                <div onClick={() => setRole("entreprise")}>
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-accent" />
                  <p className="font-bold text-foreground text-sm">Entreprise</p>
                  <p className="text-xs text-muted-foreground mt-1">99 €/an</p>
                </div>
              </TitanCard>
              <TitanCard
                variant={role === "facilitateur" ? "elevated" : "outlined"}
                className={`cursor-pointer text-center transition-all ${
                  role === "facilitateur" ? "ring-2 ring-accent" : ""
                }`}
                padding="p-4"
              >
                <div onClick={() => setRole("facilitateur")}>
                  <Users className="h-8 w-8 mx-auto mb-2 text-titan-success" />
                  <p className="font-bold text-foreground text-sm">Facilitateur</p>
                  <p className="text-xs text-titan-success mt-1">Gratuit à vie</p>
                </div>
              </TitanCard>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <TitanInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              icon={<Mail className="h-4 w-4" />}
              required
            />
            <TitanInput
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              required
            />
            <TitanButton type="submit" loading={loading} className="w-full">
              {mode === "login"
                ? "Se connecter"
                : `S'inscrire${role === "entreprise" ? " — 99 €/an" : " — Gratuit"}`}
            </TitanButton>
          </form>
        </div>
      </div>
      <TitanFooter />
    </div>
  );
};

export default Auth;
