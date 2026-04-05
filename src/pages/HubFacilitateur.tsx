import React from "react";
import { useNavigate } from "react-router-dom";
import TitanNavbar from "@/components/titan/TitanNavbar";
import TitanCard from "@/components/titan/TitanCard";
import TitanBadge from "@/components/titan/TitanBadge";
import TitanButton from "@/components/titan/TitanButton";
import TitanTable from "@/components/titan/TitanTable";
import { QrCode, Trophy, Star, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const mockOpportunities = [
  { id: "1", title: "Recherche partenaire distribution B2B", sector: "Tech / IT", city: "Paris", score: 92 },
  { id: "2", title: "Courtier assurance entreprise", sector: "Assurance", city: "Lyon", score: 78 },
  { id: "3", title: "Expert comptable TPE", sector: "Finance", city: "Marseille", score: 65 },
];

const mockCommissions = [
  { intro: "TechCorp → Jean Dupont", amount: "1 500 €", status: "paid", date: "15 Mar 2026" },
  { intro: "FinServices → Marie Leroy", amount: "3 200 €", status: "pending", date: "28 Mar 2026" },
  { intro: "ImmoPlus → Paul Bernard", amount: "850 €", status: "pending", date: "2 Avr 2026" },
];

const HubFacilitateur = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <TitanNavbar userRole="facilitateur" onLogout={async () => { await supabase.auth.signOut(); navigate("/"); }} />
      <main className="lg:pl-60 pt-14 lg:pt-0">
        <div className="p-6 max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Hub Facilitateur</h1>
              <p className="text-muted-foreground">Vos opportunités et commissions</p>
            </div>
            <TitanBadge variant="founder">
              <Trophy className="h-3 w-3 mr-1" /> Fondateur
            </TitanBadge>
          </div>

          {/* Opportunités */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-accent" /> Opportunités
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockOpportunities.map((o) => (
                <TitanCard key={o.id} variant="outlined" className="cursor-pointer hover:titan-shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <TitanBadge variant="info">{o.sector}</TitanBadge>
                    <span className={`text-sm font-bold ${o.score > 80 ? "text-titan-success" : "text-titan-warning"}`}>
                      {o.score}%
                    </span>
                  </div>
                  <p className="font-semibold text-foreground text-sm">{o.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{o.city}</p>
                  <TitanButton variant="primary" size="sm" className="mt-3 w-full">Proposer un contact</TitanButton>
                </TitanCard>
              ))}
            </div>
          </div>

          {/* Commissions */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-accent" /> Mes Commissions
            </h2>
            <TitanTable
              columns={[
                { key: "intro", header: "Introduction" },
                { key: "amount", header: "Montant" },
                { key: "status", header: "Statut", render: (row: any) => (
                  <TitanBadge variant={row.status === "paid" ? "success" : "warning"}>
                    {row.status === "paid" ? "Payé" : "En attente"}
                  </TitanBadge>
                )},
                { key: "date", header: "Date" },
              ]}
              data={mockCommissions}
            />
          </div>

          {/* QR Weapon */}
          <TitanCard variant="outlined">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-muted rounded-xl">
                <QrCode className="h-16 w-16 text-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">QR Weapon</h3>
                <p className="text-sm text-muted-foreground">Votre QR code unique de parrainage. Scannez → inscription facilitateur avec traçabilité.</p>
                <TitanButton variant="ghost" size="sm" className="mt-2">Télécharger le QR code</TitanButton>
              </div>
            </div>
          </TitanCard>
        </div>
      </main>
    </div>
  );
};

export default HubFacilitateur;
