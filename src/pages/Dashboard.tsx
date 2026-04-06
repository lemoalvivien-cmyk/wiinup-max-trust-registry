import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TitanNavbar from "@/components/titan/TitanNavbar";
import TitanKPI from "@/components/titan/TitanKPI";
import TitanCard from "@/components/titan/TitanCard";
import TitanBadge from "@/components/titan/TitanBadge";
import TitanButton from "@/components/titan/TitanButton";
import { Clock, Target, TrendingUp, Bot, ArrowRight, Zap, Shield, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const statusLabels: Record<string, { label: string; variant: "info" | "warning" | "success" | "danger" }> = {
  draft: { label: "Brouillon", variant: "info" },
  pending: { label: "En attente", variant: "warning" },
  accepted: { label: "Accepté", variant: "success" },
  meeting_scheduled: { label: "RDV planifié", variant: "info" },
  won: { label: "Gagné", variant: "success" },
  lost: { label: "Perdu", variant: "danger" },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [intros, setIntros] = useState<any[]>([]);
  const [aiProspects, setAiProspects] = useState<any[]>([]);
  const [ghostNeeds, setGhostNeeds] = useState<any[]>([]);
  const [kpis, setKpis] = useState({ timeToFirstIntro: "—", revealToMeeting: "—", meetingToWon: "—" });
  const [networkStats, setNetworkStats] = useState({ dealsThisWeek: 0, activeFacilitateurs: 0 });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch introductions
      const { data: introData } = await supabase
        .from("introductions")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(10);

      // Fetch AI prospects
      const { data: prospects } = await supabase
        .from("ai_prospects")
        .select("*")
        .eq("status", "new")
        .order("ai_score", { ascending: false })
        .limit(5);

      // Fetch ghost needs (Besoins Fantômes IA) for cockpit jamais vide
      const { data: ghosts } = await supabase
        .from("ghost_needs")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3);

      setIntros(introData || []);
      setAiProspects(prospects || []);
      setGhostNeeds(ghosts || []);

      // Calculate KPIs from real data
      if (introData && introData.length > 0) {
        const meetings = introData.filter(i => ["meeting_scheduled", "won"].includes(i.status));
        const won = introData.filter(i => i.status === "won");

        const revealRate = introData.length > 0 ? Math.round((meetings.length / introData.length) * 100) : 0;
        const wonRate = meetings.length > 0 ? Math.round((won.length / meetings.length) * 100) : 0;

        // Calculate time-to-first-intro
        const firstIntro = introData[introData.length - 1];
        const hours = firstIntro ? Math.round((new Date(firstIntro.updated_at).getTime() - new Date(firstIntro.created_at).getTime()) / 3600000) : 0;

        setKpis({
          timeToFirstIntro: hours > 0 ? `${hours}h` : "< 72h",
          revealToMeeting: `${revealRate}%`,
          meetingToWon: `${wonRate}%`,
        });
      }

      // Network stats (public count)
      const { count: dealsCount } = await supabase
        .from("introductions")
        .select("*", { count: "exact", head: true })
        .eq("status", "won");

      const { count: facCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "facilitateur");

      setNetworkStats({
        dealsThisWeek: dealsCount || 0,
        activeFacilitateurs: facCount || 0,
      });
    };

    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <TitanNavbar userRole={profile?.role as any || "entreprise"} onLogout={async () => { await supabase.auth.signOut(); navigate("/"); }} />
      <main className="lg:pl-60 pt-14 lg:pt-0">
        <div className="p-6 max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
            </div>
            {/* 99€ pricing always visible — CDC §2 */}
            {profile?.role === "entreprise" && profile?.subscription_status !== "active" && (
              <TitanButton size="sm" icon={<CreditCard className="h-4 w-4" />} onClick={() => navigate("/pricing")}>
                Activer — 99 €/an
              </TitanButton>
            )}
          </div>

          {/* 3 KPIs Titan — CDC §15 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TitanKPI label="Time-to-first-intro" value={kpis.timeToFirstIntro} trend="up" trendValue="Cible < 72h" icon={<Clock className="h-5 w-5" />} />
            <TitanKPI label="Reveal-to-meeting rate" value={kpis.revealToMeeting} trend="up" trendValue="Cible > 50%" icon={<Target className="h-5 w-5" />} />
            <TitanKPI label="Meeting-to-won rate" value={kpis.meetingToWon} trend="up" trendValue="Cible > 30%" icon={<TrendingUp className="h-5 w-5" />} />
          </div>

          {/* Revenue Inbox */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Revenue Inbox</h2>
            {intros.length > 0 ? (
              <div className="space-y-3">
                {intros.map((intro) => (
                  <TitanCard key={intro.id} variant="outlined" padding="p-4" className="flex items-center justify-between cursor-pointer hover:titan-shadow-md transition-shadow"
                    onClick={() => navigate(`/introductions/${intro.id}`)}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                        {intro.prospect_name?.[0] || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{intro.prospect_name}</p>
                        <p className="text-xs text-muted-foreground">{intro.prospect_company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <TitanBadge variant={statusLabels[intro.status]?.variant || "info"}>
                        {statusLabels[intro.status]?.label || intro.status}
                      </TitanBadge>
                      {intro.deal_amount && <span className="text-sm font-semibold text-foreground">{new Intl.NumberFormat("fr-FR").format(intro.deal_amount)} €</span>}
                    </div>
                  </TitanCard>
                ))}
              </div>
            ) : (
              <TitanCard variant="outlined" className="text-center py-8">
                <p className="text-muted-foreground">Aucune introduction pour le moment.</p>
                <TitanButton variant="ghost" size="sm" className="mt-2" onClick={() => navigate("/besoins")}>
                  Publier un besoin pour recevoir des introductions
                </TitanButton>
              </TitanCard>
            )}
          </div>

          {/* Flux IA — CDC §8.3 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Bot className="h-5 w-5 text-accent" /> Flux IA — Prospects trouvés cette nuit
              </h2>
              <TitanButton variant="ghost" size="sm" onClick={() => navigate("/ia-prospection")}>
                Voir tout <ArrowRight className="h-4 w-4" />
              </TitanButton>
            </div>
            {aiProspects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiProspects.slice(0, 3).map((p) => (
                  <TitanCard key={p.id} variant="outlined" className="cursor-pointer hover:titan-shadow-md transition-shadow"
                    onClick={() => navigate("/ia-prospection")}>
                    <div className="flex items-center justify-between mb-2">
                      <TitanBadge variant="info">{p.source?.toUpperCase()}</TitanBadge>
                      <span className={`text-sm font-bold ${(p.ai_score || 0) > 80 ? "text-titan-success" : "text-titan-warning"}`}>
                        {p.ai_score}%
                      </span>
                    </div>
                    <p className="font-semibold text-foreground">{p.company_name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <Zap className="h-3 w-3 inline mr-1" />{p.signal_type}
                    </p>
                  </TitanCard>
                ))}
              </div>
            ) : ghostNeeds.length > 0 ? (
              /* Besoins Fantômes fallback — CDC §5 "Cockpit jamais vide" */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ghostNeeds.map((g) => (
                  <TitanCard key={g.id} variant="outlined" className="border-dashed">
                    <div className="flex items-center gap-2 mb-2">
                      <TitanBadge variant="warning">Besoin Fantôme IA</TitanBadge>
                    </div>
                    <p className="font-semibold text-foreground text-sm">{g.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{g.sector_target} — Détecté par IA</p>
                    <TitanButton variant="ghost" size="sm" className="mt-2 w-full" onClick={() => navigate("/facilitateur")}>
                      Voir les opportunités
                    </TitanButton>
                  </TitanCard>
                ))}
              </div>
            ) : (
              <TitanCard variant="outlined" className="text-center py-6">
                <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">L'IA analyse votre secteur. Les premiers prospects arriveront bientôt.</p>
                <p className="text-xs text-muted-foreground mt-1">Scraping BODACC, Pappers, INSEE en cours...</p>
              </TitanCard>
            )}
          </div>

          {/* Fallback — cockpit jamais vide — CDC §5 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TitanCard variant="outlined" className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-accent flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Audit trail actif</p>
                <p className="text-xs text-muted-foreground">Chaque action horodatée SHA-256. Preuves opposables en litige.</p>
              </div>
            </TitanCard>
            <TitanCard variant="outlined" className="text-center">
              <p className="text-sm text-muted-foreground">
                <Zap className="h-4 w-4 inline mr-1 text-accent" />
                {networkStats.dealsThisWeek} deals conclus sur la plateforme • {networkStats.activeFacilitateurs} facilitateurs actifs
              </p>
            </TitanCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
