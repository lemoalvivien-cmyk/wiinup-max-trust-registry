import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TitanButton from "@/components/titan/TitanButton";
import TitanInput from "@/components/titan/TitanInput";
import TitanSelect from "@/components/titan/TitanSelect";
import TitanCard from "@/components/titan/TitanCard";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const sectors = [
  { value: "", label: "Sélectionnez un secteur" },
  { value: "immobilier", label: "Immobilier" },
  { value: "assurance", label: "Assurance" },
  { value: "finance", label: "Finance" },
  { value: "tech", label: "Tech / IT" },
  { value: "conseil", label: "Conseil" },
  { value: "btp", label: "BTP" },
  { value: "sante", label: "Santé" },
  { value: "autre", label: "Autre" },
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const role = profile?.role || "entreprise";
  const [companyName, setCompanyName] = useState("");
  const [siren, setSiren] = useState("");
  const [sector, setSector] = useState("");
  const [city, setCity] = useState("");
  const [besoinTitle, setBesoinTitle] = useState("");
  const [besoinDesc, setBesoinDesc] = useState("");
  const [besoinSector, setBesoinSector] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const totalSteps = 3;

  const handleNext = async () => {
    if (step === 1 && user) {
      setSaving(true);
      await supabase.from("profiles").update({
        company_name: companyName || null,
        siren: siren || null,
        sector: sector || null,
        city: city || null,
      }).eq("id", user.id);
      setSaving(false);
    }

    if (step === 2 && role === "entreprise" && user && besoinTitle && besoinDesc && besoinSector) {
      setSaving(true);
      const { error } = await supabase.from("besoins").insert({
        entreprise_id: user.id,
        title: besoinTitle.slice(0, 120),
        description: besoinDesc.slice(0, 500),
        sector_target: besoinSector,
      });
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    if (step === 2 && role === "facilitateur" && user) {
      setSaving(true);
      await supabase.from("profiles").update({
        sector: sector || null,
        city: city || null,
      }).eq("id", user.id);
      setSaving(false);
    }

    setStep(step + 1);
  };

  const handleFinish = async () => {
    if (user) {
      await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
    }
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="w-full bg-muted h-1">
        <div className="h-full bg-accent transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground">Étape {step} sur {totalSteps}</p>
            <h1 className="text-2xl font-bold text-foreground mt-1">
              {step === 1 ? "Votre société" : step === 2 ? (role === "entreprise" ? "Votre premier besoin" : "Vos expertises") : "C'est parti !"}
            </h1>
          </div>

          {step === 1 && (
            <TitanCard variant="outlined">
              <div className="space-y-4">
                <TitanInput label="Nom de la société" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ma Société SAS" />
                <TitanInput label="SIREN (optionnel)" value={siren} onChange={(e) => setSiren(e.target.value)} placeholder="123 456 789" />
                <TitanSelect label="Secteur d'activité" options={sectors} value={sector} onChange={(e) => setSector(e.target.value)} />
                <TitanInput label="Ville" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Paris" />
              </div>
            </TitanCard>
          )}

          {step === 2 && role === "entreprise" && (
            <TitanCard variant="outlined">
              <div className="space-y-4">
                <TitanInput label="Titre du besoin (120 caractères max)" value={besoinTitle}
                  onChange={(e) => setBesoinTitle(e.target.value.slice(0, 120))}
                  placeholder="Recherche partenaire pour distribution B2B" />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Description (500 caractères max)</label>
                  <textarea
                    className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]"
                    value={besoinDesc} onChange={(e) => setBesoinDesc(e.target.value.slice(0, 500))}
                    placeholder="Décrivez votre besoin. L'IA structurera votre demande automatiquement."
                  />
                  <p className="text-xs text-muted-foreground text-right">{besoinDesc.length}/500</p>
                </div>
                <TitanSelect label="Secteur cible" options={sectors} value={besoinSector} onChange={(e) => setBesoinSector(e.target.value)} />
              </div>
            </TitanCard>
          )}

          {step === 2 && role === "facilitateur" && (
            <TitanCard variant="outlined">
              <div className="space-y-4">
                <TitanSelect label="Secteurs d'expertise" options={sectors} value={sector} onChange={(e) => setSector(e.target.value)} />
                <TitanInput label="Ville(s) d'action" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Paris, Lyon, Marseille" />
              </div>
            </TitanCard>
          )}

          {step === 3 && (
            <TitanCard className="text-center">
              <div className="w-16 h-16 rounded-full bg-titan-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-titan-success" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Tout est prêt !</h2>
              <p className="text-muted-foreground">Votre compte est configuré. Accédez à votre tableau de bord pour commencer.</p>
            </TitanCard>
          )}

          <div className="flex gap-3">
            {step > 1 && <TitanButton variant="ghost" onClick={() => setStep(step - 1)}>Précédent</TitanButton>}
            <TitanButton className="flex-1" loading={saving} onClick={step < totalSteps ? handleNext : handleFinish}>
              {step < totalSteps ? "Suivant" : "Accéder au Dashboard"}
            </TitanButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
