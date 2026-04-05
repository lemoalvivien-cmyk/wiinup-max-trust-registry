import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TitanNavbar from "@/components/titan/TitanNavbar";
import TitanCard from "@/components/titan/TitanCard";
import TitanInput from "@/components/titan/TitanInput";
import TitanSelect from "@/components/titan/TitanSelect";
import TitanButton from "@/components/titan/TitanButton";
import TitanBadge from "@/components/titan/TitanBadge";
import { User, CreditCard, Shield, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Account = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("Ma Société SAS");
  const [phone, setPhone] = useState("+33 6 12 34 56 78");
  const [sector, setSector] = useState("tech");

  return (
    <div className="min-h-screen bg-background">
      <TitanNavbar userRole="entreprise" onLogout={async () => { await supabase.auth.signOut(); navigate("/"); }} />
      <main className="lg:pl-60 pt-14 lg:pt-0">
        <div className="p-6 max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mon Compte</h1>
            <p className="text-muted-foreground">Gérez votre profil et abonnement</p>
          </div>

          {/* Profile */}
          <TitanCard variant="outlined">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <User className="h-5 w-5" /> Informations
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent text-2xl font-bold">
                  M
                </div>
                <TitanButton variant="ghost" size="sm">Changer l'avatar</TitanButton>
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
              <TitanButton>Sauvegarder</TitanButton>
            </div>
          </TitanCard>

          {/* Subscription */}
          <TitanCard variant="outlined">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> Abonnement
            </h2>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-foreground">Plan Starter</p>
                <p className="text-sm text-muted-foreground">99 €/an • Renouvellement le 1 Jan 2027</p>
              </div>
              <TitanBadge variant="success">Actif</TitanBadge>
            </div>
            <TitanButton variant="ghost" size="sm">Gérer mon abonnement</TitanButton>
          </TitanCard>

          {/* Security */}
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
