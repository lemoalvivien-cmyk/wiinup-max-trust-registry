import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TitanNavbar from "@/components/titan/TitanNavbar";
import TitanCard from "@/components/titan/TitanCard";
import TitanInput from "@/components/titan/TitanInput";
import TitanSelect from "@/components/titan/TitanSelect";
import TitanButton from "@/components/titan/TitanButton";
import TitanBadge from "@/components/titan/TitanBadge";
import { User, CreditCard, Shield, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Account = () => {
  const navigate = useNavigate();
  const { user, profile, setProfile } = useAuth();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [sector, setSector] = useState("");
  const [saving, setSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.company_name || "");
      setPhone(profile.phone || "");
      setSector(profile.sector || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      company_name: companyName,
      phone,
      sector,
    }).eq("id", user.id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profil mis à jour" });
    }
    setSaving(false);
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session");
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  const planLabels: Record<string, string> = {
    starter: "Starter — 99 €/an",
    pro: "Pro — 29 €/mois",
    performance: "Performance — 99 €/mois",
  };

  return (
    <div className="min-h-screen bg-background">
      <TitanNavbar userRole={profile?.role as any || "entreprise"} onLogout={async () => { await supabase.auth.signOut(); navigate("/"); }} />
      <main className="lg:pl-60 pt-14 lg:pt-0">
        <div className="p-6 max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mon Compte</h1>
            <p className="text-muted-foreground">Gérez votre profil et abonnement</p>
          </div>

          <TitanCard variant="outlined">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <User className="h-5 w-5" /> Informations
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent text-2xl font-bold">
                  {companyName?.[0] || user?.email?.[0]?.toUpperCase() || "?"}
                </div>
              </div>
              <TitanInput label="Nom de la société" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              <TitanInput label="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <TitanSelect label="Secteur" value={sector} onChange={(e) => setSector(e.target.value)}
                options={[
                  { value: "immobilier", label: "Immobilier" },
                  { value: "assurance", label: "Assurance" },
                  { value: "finance", label: "Finance" },
                  { value: "tech", label: "Tech / IT" },
                  { value: "conseil", label: "Conseil" },
                ]} />
              <TitanButton loading={saving} onClick={handleSave}>Sauvegarder</TitanButton>
            </div>
          </TitanCard>

          {/* Subscription - only for entreprise */}
          {profile?.role === "entreprise" && (
            <TitanCard variant="outlined">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Abonnement
              </h2>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-foreground">{planLabels[profile?.subscription_plan || "starter"] || "Aucun plan"}</p>
                  <p className="text-sm text-muted-foreground">
                    Statut : {profile?.subscription_status === "active" ? "Actif" : profile?.subscription_status || "Inactif"}
                  </p>
                </div>
                <TitanBadge variant={profile?.subscription_status === "active" ? "success" : "warning"}>
                  {profile?.subscription_status === "active" ? "Actif" : "Inactif"}
                </TitanBadge>
              </div>
              {profile?.stripe_customer_id ? (
                <TitanButton variant="ghost" size="sm" loading={portalLoading} onClick={handlePortal}>
                  Gérer mon abonnement
                </TitanButton>
              ) : (
                <TitanButton size="sm" onClick={() => navigate("/pricing")}>
                  Choisir un plan
                </TitanButton>
              )}
            </TitanCard>
          )}

          <TitanCard variant="outlined">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" /> Sécurité
            </h2>
            <div className="space-y-3">
              <TitanButton variant="ghost" size="sm">Changer le mot de passe</TitanButton>
              <div className="border-t border-border pt-3">
                <TitanButton variant="danger" size="sm" icon={<Trash2 className="h-4 w-4" />}>
                  Supprimer mon compte
                </TitanButton>
              </div>
            </div>
          </TitanCard>
        </div>
      </main>
    </div>
  );
};

export default Account;
