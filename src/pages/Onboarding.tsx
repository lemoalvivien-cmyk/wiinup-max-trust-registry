import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import TitanButton from "@/components/titan/TitanButton";
import TitanCard from "@/components/titan/TitanCard";

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
  const [role, setRole] = useState<"entreprise" | "facilitateur">("entreprise");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [siren, setSiren] = useState("");
  const [sector, setSector] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // SIREN validation state
  const [sirenValidating, setSirenValidating] = useState(false);
  const [sirenError, setSirenError] = useState("");
  const [sirenValid, setSirenValid] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const validateSirenFormat = (value: string): boolean => {
    return /^\d{9}$/.test(value.replace(/\s/g, ""));
  };

  const handleSirenChange = (value: string) => {
    setSiren(value);
    setSirenError("");
    setSirenValid(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const clean = value.replace(/\s/g, "");
    if (!clean) return;

    if (clean.length < 9) {
      setSirenError("Le SIREN doit contenir 9 chiffres");
      return;
    }

    if (!/^\d+$/.test(clean)) {
      setSirenError("Le SIREN ne doit contenir que des chiffres");
      return;
    }

    if (!validateSirenFormat(value)) {
      setSirenError("Le SIREN doit contenir exactement 9 chiffres");
      return;
    }

    // Debounce API call
    debounceRef.current = setTimeout(async () => {
      setSirenValidating(true);
      try {
        const { data, error } = await supabase.functions.invoke("validate-siren", {
          body: { siren: clean },
        });
        if (error) {
          setSirenError("Erreur de validation");
          return;
        }
        if (data?.valid && data?.company_name) {
          setSirenValid(true);
          setCompanyName(data.company_name);
          setSirenError("");
        } else {
          setSirenError(data?.error || "SIREN invalide ou introuvable");
        }
      } catch {
        setSirenError("Erreur de connexion au service de validation");
      } finally {
        setSirenValidating(false);
      }
    }, 500);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }

    const updates: any = {
      role,
      full_name: fullName,
      company_name: companyName,
      siren: siren.replace(/\s/g, "") || null,
      sector,
      onboarding_completed: true,
    };

    await supabase.from("profiles").update(updates).eq("id", user.id);
    setSaving(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-accent" : "bg-muted"}`} />
          ))}
        </div>

        {/* Step 1: Role */}
        {step === 1 && (
          <TitanCard variant="outlined">
            <h2 className="text-xl font-bold text-foreground mb-2">Bienvenue sur WIINUP</h2>
            <p className="text-muted-foreground text-sm mb-6">Choisissez votre profil pour commencer.</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setRole("entreprise")}
                className={`p-4 rounded-lg border-2 text-center transition ${role === "entreprise" ? "border-accent bg-accent/5" : "border-border"}`}
              >
                <p className="font-bold text-foreground">Entreprise</p>
                <p className="text-xs text-muted-foreground mt-1">Je cherche des clients</p>
              </button>
              <button
                onClick={() => setRole("facilitateur")}
                className={`p-4 rounded-lg border-2 text-center transition ${role === "facilitateur" ? "border-accent bg-accent/5" : "border-border"}`}
              >
                <p className="font-bold text-foreground">Facilitateur</p>
                <p className="text-xs text-muted-foreground mt-1">Je connecte les gens</p>
              </button>
            </div>
            <TitanButton className="w-full" onClick={() => setStep(2)}>Continuer</TitanButton>
          </TitanCard>
        )}

        {/* Step 2: Profil */}
        {step === 2 && (
          <TitanCard variant="outlined">
            <h2 className="text-xl font-bold text-foreground mb-2">Votre profil</h2>
            <p className="text-muted-foreground text-sm mb-6">Ces informations nous aident à vous connecter.</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Nom complet</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Jean Dupont"
                  className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Nom de la société</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="Ma Société SAS"
                  className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* SIREN with validation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-foreground">SIREN</label>
                  {sirenValidating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {sirenValid && <Check className="h-4 w-4 text-green-500" />}
                </div>
                <input
                  type="text"
                  value={siren}
                  onChange={e => handleSirenChange(e.target.value)}
                  placeholder="123456789"
                  maxLength={11}
                  className={`w-full rounded-lg border ${
                    sirenError ? "border-red-500 focus:ring-red-500" :
                    sirenValid ? "border-green-500 focus:ring-green-500" :
                    "border-input focus:ring-ring"
                  } bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2`}
                />
                {sirenError && (
                  <div className="flex items-center gap-1 mt-1 text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span className="text-xs">{sirenError}</span>
                  </div>
                )}
                {sirenValid && (
                  <p className="text-xs text-green-600 mt-1">SIREN vérifié — société auto-remplie</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Secteur</label>
                <select
                  value={sector}
                  onChange={e => setSector(e.target.value)}
                  className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {sectors.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <TitanButton variant="ghost" onClick={() => setStep(1)}>Retour</TitanButton>
              <TitanButton className="flex-1" onClick={() => setStep(3)}>Continuer</TitanButton>
            </div>
          </TitanCard>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <TitanCard variant="outlined" className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Tout est prêt !</h2>
            <p className="text-muted-foreground text-sm mb-6">
              {role === "entreprise"
                ? "Votre espace entreprise est configuré. Publiez votre premier besoin."
                : "Votre profil facilitateur est actif. Découvrez les besoins disponibles."}
            </p>
            <div className="flex gap-3">
              <TitanButton variant="ghost" onClick={() => setStep(2)}>Retour</TitanButton>
              <TitanButton className="flex-1" loading={saving} onClick={handleSave}>
                Accéder au Dashboard
              </TitanButton>
            </div>
          </TitanCard>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
