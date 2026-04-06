import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TitanButton from "@/components/titan/TitanButton";
import TitanCard from "@/components/titan/TitanCard";
import TitanBadge from "@/components/titan/TitanBadge";
import TitanFooter from "@/components/titan/TitanFooter";
import { Check, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "99 €",
    period: "/an",
    popular: true,
    features: [
      "Besoins illimités",
      "Pipeline introductions",
      "Preuves horodatées SHA-256",
      "5 prospects IA / jour",
      "Audit trail complet",
      "Support email",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "29 €",
    period: "/mois",
    popular: false,
    features: [
      "Tout Starter +",
      "20 prospects IA / jour",
      "Rapports avancés",
      "Besoins Fantômes IA",
      "Support prioritaire",
      "API access",
    ],
  },
  {
    id: "performance",
    name: "Performance",
    price: "99 €",
    period: "/mois",
    popular: false,
    features: [
      "Tout Pro +",
      "Prospects IA illimités",
      "Concierge dédié",
      "Intégrations CRM",
      "Onboarding personnalisé",
      "SLA garanti",
    ],
  },
];

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: string) => {
    if (!user) {
      navigate("/auth?role=entreprise");
      return;
    }

    setLoading(plan);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { plan },
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-sm">W</span>
            </div>
            <span className="text-lg font-bold text-foreground">WIINUP</span>
          </Link>
          <Link to="/auth"><TitanButton variant="ghost" size="sm">Connexion</TitanButton></Link>
        </div>
      </header>

      <section className="pt-28 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-black text-foreground">
              Choisissez votre plan
            </h1>
            <p className="text-muted-foreground mt-2">Facilitateurs : gratuit à vie, aucune CB requise.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <TitanCard
                key={plan.id}
                variant={plan.popular ? "elevated" : "outlined"}
                className={plan.popular ? "border-2 border-accent relative" : ""}
              >
                {plan.popular && (
                  <TitanBadge variant="warning" className="absolute -top-3 left-1/2 -translate-x-1/2">
                    POPULAIRE
                  </TitanBadge>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-black text-accent">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-titan-success flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <TitanButton
                  className="w-full"
                  variant={plan.popular ? "primary" : "secondary"}
                  loading={loading === plan.id}
                  onClick={() => handleCheckout(plan.id)}
                  icon={plan.popular ? <Zap className="h-4 w-4" /> : undefined}
                >
                  Démarrer {plan.name}
                </TitanButton>
              </TitanCard>
            ))}
          </div>
        </div>
      </section>

      <TitanFooter />
    </div>
  );
};

export default Pricing;
