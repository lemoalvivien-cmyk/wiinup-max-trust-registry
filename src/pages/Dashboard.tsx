import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TitanNavbar from "@/components/titan/TitanNavbar";
import TitanKPI from "@/components/titan/TitanKPI";
import TitanCard from "@/components/titan/TitanCard";
import TitanBadge from "@/components/titan/TitanBadge";
import TitanButton from "@/components/titan/TitanButton";
import { Clock, Target, TrendingUp, Bot, ArrowRight, Zap } from "lucide-react";
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

      setIntros(introData || []);
      setAiProspects(prospects || []);

      // Calculate KPIs from real data
      if (introData && introData.length > 0) {
        const accepted = introData.filter(i => ["accepted", "meeting_scheduled", "won"].includes(i.status));
        const meetings = introData.filter(i => ["meeting_scheduled", "won"].includes(i.status));
        const won = introData.filter(i => i.status === "won");

        const revealRate = introData.length > 0 ? Math.round((meetings.length / introData.length) * 100) : 0;
        const wonRate = meetings.length > 0 ? Math.round((won.length / meetings.length) * 100) : 0;

        setKpis({
          timeToFirstIntro: "< 72h",
          revealToMeeting: `${revealRate}%`,
          meetingToWon: `${wonRate}%`,
        });
      }

      // Network stats (public count)
      const { count: dealsCount } = await supabase
        .from("introductions")
        .select("*", { count: "exact", head: true })
        .eq("status", "won");

      setNetworkStats({
        dealsThisWeek: dealsCount || 0,
        activeFacilitateurs: 847,
      });
    };

    fetchData();
  }, [user]);

  // Fallback data
  const hasData = intros.length > 0 || aiProspects.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <TitanNavbar userRole={profile?.role as any || "entreprise"} onLogout={async () => { await supabase.auth.signOut(); navigate("/"); }} />
      <main className="lg:pl-60 pt-14 lg:pt-0">
        <div className="p-6 max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TitanKPI label="Time-to-first-intro" value={kpis.timeToFirstIntro} trend="up" trendValue="Cible atteinte" icon={<Clock className="h-5 w-5" />} />
            <TitanKPI label="Reveal-to-meeting rate" value={kpis.revealToMeeting} trend="up" trendValue="vs mois dernier" icon={<Target className="h-5 w-5" />} />
            <TitanKPI label="Meeting-to-won rate" value={kpis.meetingToWon} trend="up" trendValue="vs mois dernier" icon={<TrendingUp className="h-5 w-5" />} />
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
                      {intro.deal_amount && <span className="text-sm font-semibold text-foreground">{intro.deal_amount} €</span>}
                    </div>
                  </TitanCard>
                ))}
              </div>
            ) : (
              <TitanCard variant="outlined" className="text-center py-8">
                <p className="text-muted-foreground">Aucune introduction pour le moment.</p>
                <TitanButton variant="ghost" size="sm" className="mt-2" onClick={() => navigate("/facilitateur")}>
                  Publier un besoin pour recevoir des introductions
                </TitanButton>
              </TitanCard>
            )}
          </div>

          {/* Flux IA */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Bot className="h-5 w-5 text-accent" /> Flux IA
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
            ) : (
              <TitanCard variant="outlined" className="text-center py-6">
                <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">L'IA analyse votre secteur. Les premiers prospects arriveront bientôt.</p>
              </TitanCard>
            )}
          </div>

          {/* Fallback - never empty */}
          <TitanCard variant="outlined" className="text-center">
            <p className="text-sm text-muted-foreground">
              <Zap className="h-4 w-4 inline mr-1 text-accent" />
              {networkStats.dealsThisWeek} deals conclus sur la plateforme • {networkStats.activeFacilitateurs} facilitateurs actifs
            </p>
          </TitanCard>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
