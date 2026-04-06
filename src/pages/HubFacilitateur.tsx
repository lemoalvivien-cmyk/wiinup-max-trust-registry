import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TitanNavbar from "@/components/titan/TitanNavbar";
import TitanCard from "@/components/titan/TitanCard";
import TitanBadge from "@/components/titan/TitanBadge";
import TitanButton from "@/components/titan/TitanButton";
import TitanTable from "@/components/titan/TitanTable";
import { QrCode, Trophy, Star, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { QRCodeSVG } from "qrcode.react";

const HubFacilitateur = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      // Active besoins (opportunities)
      const { data: besoins } = await supabase
        .from("besoins")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(10);

      setOpportunities(besoins || []);

      // Commissions
      const { data: comms } = await supabase
        .from("commissions")
        .select("*, introductions(prospect_name, prospect_company)")
        .order("created_at", { ascending: false });

      setCommissions(comms || []);
    };

    fetch();
  }, [user]);

  const qrUrl = `${window.location.origin}/join?ref=${profile?.qr_code_token || ""}`;

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
            {profile?.is_founder && (
              <TitanBadge variant="founder">
                <Trophy className="h-3 w-3 mr-1" /> Fondateur
              </TitanBadge>
            )}
          </div>

          {/* Opportunités */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-accent" /> Opportunités
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {opportunities.length > 0 ? opportunities.map((o) => (
                <TitanCard key={o.id} variant="outlined" className="cursor-pointer hover:titan-shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <TitanBadge variant="info">{o.sector_target}</TitanBadge>
                    {o.is_phantom && <TitanBadge variant="warning">Généré par IA</TitanBadge>}
                  </div>
                  <p className="font-semibold text-foreground text-sm">{o.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{o.description}</p>
                  <TitanButton variant="primary" size="sm" className="mt-3 w-full">Proposer un contact</TitanButton>
                </TitanCard>
              )) : (
                <TitanCard variant="outlined" className="text-center py-6 col-span-3">
                  <p className="text-muted-foreground">Aucune opportunité pour le moment.</p>
                </TitanCard>
              )}
            </div>
          </div>

          {/* Commissions */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-accent" /> Mes Commissions
            </h2>
            {commissions.length > 0 ? (
              <TitanTable
                columns={[
                  { key: "intro", header: "Introduction", render: (row: any) => (
                    <span>{row.introductions?.prospect_company || "—"} → {row.introductions?.prospect_name || "—"}</span>
                  )},
                  { key: "amount", header: "Montant", render: (row: any) => `${row.amount} €` },
                  { key: "status", header: "Statut", render: (row: any) => (
                    <TitanBadge variant={row.status === "paid" ? "success" : "warning"}>
                      {row.status === "paid" ? "Payé" : "En attente"}
                    </TitanBadge>
                  )},
                  { key: "created_at", header: "Date", render: (row: any) => new Date(row.created_at).toLocaleDateString("fr-FR") },
                ]}
                data={commissions}
              />
            ) : (
              <TitanCard variant="outlined" className="text-center py-6">
                <p className="text-muted-foreground">Aucune commission pour le moment. Faites vos premières introductions !</p>
              </TitanCard>
            )}
          </div>

          {/* QR Weapon */}
          <TitanCard variant="outlined">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-muted rounded-xl">
                {showQR ? (
                  <QRCodeSVG value={qrUrl} size={128} />
                ) : (
                  <QrCode className="h-16 w-16 text-foreground" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">QR Weapon</h3>
                <p className="text-sm text-muted-foreground">Votre QR code unique de parrainage. Scannez → inscription facilitateur avec traçabilité.</p>
                <div className="flex gap-2 mt-2">
                  <TitanButton variant="ghost" size="sm" onClick={() => setShowQR(!showQR)}>
                    {showQR ? "Masquer" : "Afficher le QR code"}
                  </TitanButton>
                </div>
              </div>
            </div>
          </TitanCard>
        </div>
      </main>
    </div>
  );
};

export default HubFacilitateur;
