import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TitanNavbar from "@/components/titan/TitanNavbar";
import TitanKPI from "@/components/titan/TitanKPI";
import TitanCard from "@/components/titan/TitanCard";
import TitanBadge from "@/components/titan/TitanBadge";
import TitanButton from "@/components/titan/TitanButton";
import TitanTable from "@/components/titan/TitanTable";
import TitanInput from "@/components/titan/TitanInput";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Users, AlertTriangle, TrendingUp, Bot, DollarSign, Shield } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const DONUT_COLORS = ["hsl(215,16%,47%)", "hsl(38,92%,50%)", "hsl(210,100%,56%)", "hsl(22,100%,52%)", "hsl(142,71%,45%)", "hsl(0,84%,60%)"];

const Admin = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<"dashboard" | "users" | "fraud" | "intros" | "ai">("dashboard");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [fraudFlags, setFraudFlags] = useState<any[]>([]);
  const [allIntros, setAllIntros] = useState<any[]>([]);
  const [aiProspects, setAiProspects] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [kpis, setKpis] = useState({ mrr: 0, entreprises: 0, facilitateurs: 0, totalIntros: 0, conversionRate: 0 });
  const [mrrHistory] = useState(Array.from({ length: 12 }, (_, i) => ({ month: new Date(2025, i).toLocaleDateString("fr-FR", { month: "short" }), mrr: Math.floor(Math.random() * 5000 + 2000) })));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      const [{ data: profs }, { data: flags }, { data: intros }, { data: prospects }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("fraud_flags").select("*").eq("resolved", false).order("created_at", { ascending: false }),
        supabase.from("introductions").select("*").order("updated_at", { ascending: false }),
        supabase.from("ai_prospects").select("*").order("created_at", { ascending: false }).limit(100),
      ]);
      setProfiles(profs || []);
      setFraudFlags(flags || []);
      setAllIntros(intros || []);
      setAiProspects(prospects || []);

      const entreprises = (profs || []).filter(p => p.role === "entreprise" && p.subscription_status === "active");
      const facilitateurs = (profs || []).filter(p => p.role === "facilitateur");
      const won = (intros || []).filter(i => i.status === "won");
      setKpis({
        mrr: entreprises.length * 8, // ~8€/month for 99€/yr
        entreprises: entreprises.length,
        facilitateurs: facilitateurs.length,
        totalIntros: (intros || []).length,
        conversionRate: (intros || []).length > 0 ? Math.round((won.length / (intros || []).length) * 100) : 0,
      });
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  const introsByStatus = ["draft", "pending", "accepted", "meeting_scheduled", "won", "lost", "rejected"].map(s => ({
    name: s, value: allIntros.filter(i => i.status === s).length,
  })).filter(s => s.value > 0);

  const handleResolveFraud = async (flagId: string) => {
    await supabase.from("fraud_flags").update({ resolved: true, resolved_by: user?.id }).eq("id", flagId);
    setFraudFlags(fraudFlags.filter(f => f.id !== flagId));
    toast({ title: "Flag résolu" });
  };

  const handleSuspend = async (userId: string) => {
    await supabase.from("profiles").update({ reputation_score: 0 }).eq("id", userId);
    toast({ title: "Utilisateur suspendu", description: "Score de réputation mis à 0" });
  };

  const churnRisk = profiles.filter(p =>
    p.role === "entreprise" && p.subscription_status === "active" &&
    !allIntros.some(i => {
      const besoinOwner = i.facilitateur_id; // simplified
      return new Date(i.created_at) > new Date(Date.now() - 30 * 86400000);
    })
  );

  const filteredProfiles = profiles.filter(p =>
    !search || p.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.siren?.includes(search) || p.id.includes(search)
  );

  const validated = aiProspects.filter(p => p.status === "validated").length;
  const sent = aiProspects.filter(p => p.status === "sent").length;

  const tabs = [
    { id: "dashboard" as const, label: "Dashboard", icon: BarChart3 },
    { id: "users" as const, label: "Utilisateurs", icon: Users },
    { id: "fraud" as const, label: "Fraude", icon: AlertTriangle },
    { id: "intros" as const, label: "Introductions", icon: TrendingUp },
    { id: "ai" as const, label: "IA", icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Admin — WIINUP MAX" description="Revenue Ops admin panel" />
      <TitanNavbar userRole="admin" onLogout={async () => { await supabase.auth.signOut(); navigate("/"); }} />
      <main className="lg:pl-60 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-6 w-6 text-accent" /> Admin Revenue Ops
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors min-h-[44px] ${tab === t.id ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                <t.icon className="h-4 w-4" /> {t.label}
                {t.id === "fraud" && fraudFlags.length > 0 && (
                  <span className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">{fraudFlags.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Dashboard Tab */}
          {tab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <TitanKPI label="MRR" value={`${kpis.mrr} €`} icon={<DollarSign className="h-5 w-5" />} />
                <TitanKPI label="Entreprises payantes" value={String(kpis.entreprises)} icon={<Users className="h-5 w-5" />} />
                <TitanKPI label="Facilitateurs" value={String(kpis.facilitateurs)} icon={<Users className="h-5 w-5" />} />
                <TitanKPI label="Introductions" value={String(kpis.totalIntros)} icon={<TrendingUp className="h-5 w-5" />} />
                <TitanKPI label="Taux conversion" value={`${kpis.conversionRate}%`} icon={<BarChart3 className="h-5 w-5" />} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TitanCard variant="outlined">
                  <h3 className="text-sm font-bold text-foreground mb-4">Évolution MRR (12 mois)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={mrrHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215,16%,47%)" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(215,16%,47%)" />
                      <Tooltip />
                      <Line type="monotone" dataKey="mrr" stroke="hsl(22,100%,52%)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </TitanCard>

                <TitanCard variant="outlined">
                  <h3 className="text-sm font-bold text-foreground mb-4">Répartition par statut</h3>
                  {introsByStatus.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={introsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90}>
                          {introsByStatus.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-muted-foreground text-center py-12">Aucune donnée</p>}
                </TitanCard>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {tab === "users" && (
            <div className="space-y-4">
              <TitanInput placeholder="Recherche par nom, SIREN, ID..." value={search}
                onChange={e => setSearch(e.target.value)} />
              <TitanTable
                loading={loading}
                columns={[
                  { key: "company_name", header: "Société", render: (r: any) => r.company_name || "—" },
                  { key: "role", header: "Rôle", render: (r: any) => <TitanBadge variant={r.role === "entreprise" ? "info" : "success"}>{r.role}</TitanBadge> },
                  { key: "subscription_status", header: "Abo", render: (r: any) => (
                    <TitanBadge variant={r.subscription_status === "active" ? "success" : "warning"}>{r.subscription_status || "none"}</TitanBadge>
                  )},
                  { key: "reputation_score", header: "Réputation", render: (r: any) => (
                    <span className={r.reputation_score < 50 ? "text-destructive font-bold" : "text-foreground"}>{r.reputation_score ?? 100}</span>
                  )},
                  { key: "actions", header: "Actions", render: (r: any) => (
                    <TitanButton variant="danger" size="sm" onClick={() => handleSuspend(r.id)}>Suspendre</TitanButton>
                  )},
                ]}
                data={filteredProfiles}
              />
            </div>
          )}

          {/* Fraud Tab */}
          {tab === "fraud" && (
            <div className="space-y-4">
              {fraudFlags.length === 0 ? (
                <TitanCard variant="outlined" className="text-center py-8">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Aucun flag de fraude en cours</p>
                </TitanCard>
              ) : (
                fraudFlags.map(f => (
                  <TitanCard key={f.id} variant="outlined">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <TitanBadge variant={f.severity === "critical" ? "danger" : "warning"}>{f.severity}</TitanBadge>
                          <span className="font-semibold text-foreground text-sm">{f.flag_type}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">User: {f.flagged_user_id?.slice(0, 8)}... — {new Date(f.created_at).toLocaleDateString("fr-FR")}</p>
                        {f.evidence && (
                          <pre className="text-xs bg-muted rounded p-2 mt-2 overflow-x-auto max-w-full">{JSON.stringify(f.evidence, null, 2)}</pre>
                        )}
                      </div>
                      <TitanButton size="sm" onClick={() => handleResolveFraud(f.id)}>Résoudre</TitanButton>
                    </div>
                  </TitanCard>
                ))
              )}
            </div>
          )}

          {/* Intros Tab */}
          {tab === "intros" && (
            <div className="space-y-4">
              <TitanTable
                loading={loading}
                columns={[
                  { key: "prospect_name", header: "Prospect" },
                  { key: "prospect_company", header: "Société" },
                  { key: "status", header: "Statut", render: (r: any) => <TitanBadge variant={r.status === "won" ? "success" : r.status === "lost" || r.status === "rejected" ? "danger" : "info"}>{r.status}</TitanBadge> },
                  { key: "deal_amount", header: "Montant", render: (r: any) => r.deal_amount ? `${r.deal_amount} €` : "—" },
                  { key: "updated_at", header: "Mise à jour", render: (r: any) => new Date(r.updated_at).toLocaleDateString("fr-FR") },
                ]}
                data={allIntros}
              />
              {churnRisk.length > 0 && (
                <TitanCard variant="outlined">
                  <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-titan-warning" /> À risque de churn ({churnRisk.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">Entreprises actives sans introduction depuis 30 jours.</p>
                </TitanCard>
              )}
            </div>
          )}

          {/* AI Tab */}
          {tab === "ai" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <TitanKPI label="Total prospects" value={String(aiProspects.length)} icon={<Bot className="h-5 w-5" />} />
                <TitanKPI label="Validés" value={String(validated)} icon={<TrendingUp className="h-5 w-5" />} />
                <TitanKPI label="Envoyés" value={String(sent)} icon={<TrendingUp className="h-5 w-5" />} />
                <TitanKPI label="Taux validation" value={aiProspects.length > 0 ? `${Math.round((validated / aiProspects.length) * 100)}%` : "—"} icon={<BarChart3 className="h-5 w-5" />} />
              </div>
              <TitanCard variant="outlined">
                <h3 className="text-sm font-bold text-foreground mb-2">Top signaux</h3>
                {(() => {
                  const signals: Record<string, number> = {};
                  aiProspects.forEach(p => { if (p.signal_type) signals[p.signal_type] = (signals[p.signal_type] || 0) + 1; });
                  return Object.entries(signals).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([signal, count]) => (
                    <div key={signal} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-foreground">{signal}</span>
                      <TitanBadge variant="info">{count}</TitanBadge>
                    </div>
                  ));
                })()}
              </TitanCard>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
