import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TitanNavbar from "@/components/titan/TitanNavbar";
import TitanCard from "@/components/titan/TitanCard";
import TitanBadge from "@/components/titan/TitanBadge";
import TitanButton from "@/components/titan/TitanButton";
import TitanTable from "@/components/titan/TitanTable";
import TitanKPI from "@/components/titan/TitanKPI";
import { QrCode, Trophy, Star, DollarSign, Users, TrendingUp, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

const HubFacilitateur = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ totalCommissions: 0, pendingCount: 0, paidCount: 0, referrals: 0 });

  useEffect(() => {
    if (!user) return;

    const fetchAll = async () => {
      // Active besoins (opportunities) — including Besoins Fantômes IA
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
        .eq("facilitateur_id", user.id)
        .order("created_at", { ascending: false });

      setCommissions(comms || []);

      // Stats
      const total = (comms || []).reduce((acc, c) => acc + (c.amount || 0), 0);
      const pending = (comms || []).filter(c => c.status === "pending").length;
      const paid = (comms || []).filter(c => c.status === "paid").length;

      // Referral count
      const { count: refCount } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", user.id);

      setStats({ totalCommissions: total, pendingCount: pending, paidCount: paid, referrals: refCount || 0 });
    };

    fetchAll();
  }, [user]);

  const qrUrl = `${window.location.origin}/join?ref=${profile?.qr_code_token || ""}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    toast({ title: "Lien copié !" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <TitanNavbar userRole="facilitateur" onLogout={async () => { await supabase.auth.signOut(); navigate("/"); }} />
      <main className="lg:pl-60 pt-14 lg:pt-0">
        <div className="p-6 max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Hub Facilitateur</h1>
              <p className="text-muted-foreground">Vos opportunités, commissions et réseau — 0 € à vie</p>
            </div>
            {/* CDC §11.5 — Badge Facilitateur Fondateur */}
            {profile?.is_founder && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                <Trophy className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-bold text-amber-800">Fondateur</p>
                  <p className="text-[10px] text-amber-600">Accès prioritaire deals premium</p>
                </div>
              </div>
            )}
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TitanKPI label="Commissions totales" value={`${stats.totalCommissions} €`} icon={<DollarSign className="h-5 w-5" />} />
            <TitanKPI label="En attente" value={String(stats.pendingCount)} icon={<TrendingUp className="h-5 w-5" />} />
            <TitanKPI label="Payées" value={String(stats.paidCount)} icon={<DollarSign className="h-5 w-5" />} />
            <TitanKPI label="Filleuls" value={String(stats.referrals)} icon={<Users className="h-5 w-5" />} />
          </div>

          {/* Opportunités scorées — CDC §8.7 */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-accent" /> Opportunités
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {opportunities.length > 0 ? opportunities.map((o) => (
                <TitanCard key={o.id} variant="outlined" className="cursor-pointer hover:titan-shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <TitanBadge variant="info">{o.sector_target}</TitanBadge>
                    {o.is_phantom && <TitanBadge variant="warning">Besoin Fantôme IA</TitanBadge>}
                  </div>
                  <p className="font-semibold text-foreground text-sm">{o.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{o.description}</p>
                  <TitanButton variant="primary" size="sm" className="mt-3 w-full">Proposer un contact</TitanButton>
                </TitanCard>
              )) : (
                <TitanCard variant="outlined" className="text-center py-6 col-span-3">
                  <p className="text-muted-foreground">Aucune opportunité pour le moment. L'IA scanne votre secteur.</p>
                </TitanCard>
              )}
            </div>
          </div>

          {/* Commissions — CDC §8.7 */}
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
                <p className="text-xs text-muted-foreground mt-1">Paiement garanti par preuves opposables SHA-256</p>
              </TitanCard>
            )}
          </div>

          {/* QR Weapon — CDC §11.1 */}
          <TitanCard variant="outlined">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-muted rounded-xl flex-shrink-0">
                {showQR ? (
                  <QRCodeSVG value={qrUrl} size={160} />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center cursor-pointer" onClick={() => setShowQR(true)}>
                    <QrCode className="h-20 w-20 text-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  QR Weapon <TitanBadge variant="info">Parrainage viral</TitanBadge>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Votre QR code unique de parrainage. Client satisfait → scan → facilitateur en 30 secondes.
                  Le facilitateur recrute d'autres facilitateurs. Boule de neige sans budget pub.
                </p>
                <div className="flex gap-2 mt-4">
                  <TitanButton variant="ghost" size="sm" onClick={() => setShowQR(!showQR)}>
                    {showQR ? "Masquer" : "Afficher le QR code"}
                  </TitanButton>
                  <TitanButton variant="ghost" size="sm" onClick={handleCopyLink}
                    icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}>
                    {copied ? "Copié !" : "Copier le lien"}
                  </TitanButton>
                </div>
                <p className="text-xs text-muted-foreground mt-3 break-all">{qrUrl}</p>
              </div>
            </div>
          </TitanCard>
        </div>
      </main>
    </div>
  );
};

export default HubFacilitateur;
