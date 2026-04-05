import React from "react";
import { useNavigate } from "react-router-dom";
import TitanNavbar from "@/components/titan/TitanNavbar";
import TitanKPI from "@/components/titan/TitanKPI";
import TitanCard from "@/components/titan/TitanCard";
import TitanBadge from "@/components/titan/TitanBadge";
import TitanButton from "@/components/titan/TitanButton";
import { Clock, Target, TrendingUp, Bot, ArrowRight, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const mockIntros = [
  { id: "1", prospect: "Jean Dupont", company: "TechCorp", status: "pending", amount: "15 000 €", days: 2 },
  { id: "2", prospect: "Marie Leroy", company: "FinServices", status: "accepted", amount: "32 000 €", days: 5 },
  { id: "3", prospect: "Paul Bernard", company: "ImmoPlus", status: "meeting_scheduled", amount: "8 500 €", days: 1 },
];

const mockAIProspects = [
  { id: "1", company: "NovaTech SAS", signal: "Augmentation de capital", score: 87, source: "BODACC" },
  { id: "2", company: "GreenBuild SARL", signal: "Recrutement massif", score: 73, source: "Job Boards" },
  { id: "3", company: "DigiConsult", signal: "Création d'entreprise", score: 91, source: "INSEE" },
];

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
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <TitanNavbar userRole="entreprise" onLogout={handleLogout} />
      <main className="lg:pl-60 pt-14 lg:pt-0">
        <div className="p-6 max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TitanKPI label="Time-to-first-intro" value="< 72h" trend="up" trendValue="Cible atteinte" icon={<Clock className="h-5 w-5" />} />
            <TitanKPI label="Reveal-to-meeting rate" value="62%" trend="up" trendValue="+8% vs mois dernier" icon={<Target className="h-5 w-5" />} />
            <TitanKPI label="Meeting-to-won rate" value="34%" trend="up" trendValue="+5% vs mois dernier" icon={<TrendingUp className="h-5 w-5" />} />
          </div>

          {/* Revenue Inbox */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Revenue Inbox</h2>
            <div className="space-y-3">
              {mockIntros.map((intro) => (
                <TitanCard key={intro.id} variant="outlined" padding="p-4" className="flex items-center justify-between cursor-pointer hover:titan-shadow-md transition-shadow"
                  onClick={() => navigate(`/introductions/${intro.id}`)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                      {intro.prospect[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{intro.prospect}</p>
                      <p className="text-xs text-muted-foreground">{intro.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <TitanBadge variant={statusLabels[intro.status]?.variant || "info"}>
                      {statusLabels[intro.status]?.label || intro.status}
                    </TitanBadge>
                    <span className="text-sm font-semibold text-foreground">{intro.amount}</span>
                    <span className="text-xs text-muted-foreground">{intro.days}j</span>
                  </div>
                </TitanCard>
              ))}
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockAIProspects.map((p) => (
                <TitanCard key={p.id} variant="outlined" className="cursor-pointer hover:titan-shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <TitanBadge variant="info">{p.source}</TitanBadge>
                    <span className={`text-sm font-bold ${p.score > 80 ? "text-titan-success" : "text-titan-warning"}`}>
                      {p.score}%
                    </span>
                  </div>
                  <p className="font-semibold text-foreground">{p.company}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <Zap className="h-3 w-3 inline mr-1" />{p.signal}
                  </p>
                  <TitanButton variant="ghost" size="sm" className="mt-3 w-full">Voir détails</TitanButton>
                </TitanCard>
              ))}
            </div>
          </div>

          {/* Fallback */}
          <TitanCard variant="outlined" className="text-center">
            <p className="text-sm text-muted-foreground">
              <Zap className="h-4 w-4 inline mr-1 text-accent" />
              12 deals conclus cette semaine sur la plateforme • 847 facilitateurs actifs
            </p>
          </TitanCard>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
