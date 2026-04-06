import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TitanNavbar from "@/components/titan/TitanNavbar";
import TitanCard from "@/components/titan/TitanCard";
import TitanBadge from "@/components/titan/TitanBadge";
import TitanButton from "@/components/titan/TitanButton";
import { Bot, Zap, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const sourceLabels: Record<string, string> = {
  bodacc: "BODACC", pappers: "Pappers", insee: "INSEE", press: "Presse", job_boards: "Job Boards",
};

const IAProspection = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState("");
  const [prospects, setProspects] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchProspects = async () => {
      const { data } = await supabase
        .from("ai_prospects")
        .select("*")
        .order("ai_score", { ascending: false });
      setProspects(data || []);
    };
    fetchProspects();
  }, [user]);

  const filtered = prospects.filter((p) => !filter || p.source === filter);

  const handleValidate = async (prospectId: string) => {
    setActionLoading(prospectId);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate-message", {
        body: { prospect_id: prospectId },
      });
      if (error) throw error;
      toast({ title: "Message généré", description: "Le prospect a été validé et le message est prêt." });
      // Refresh
      const { data: updated } = await supabase.from("ai_prospects").select("*").order("ai_score", { ascending: false });
      setProspects(updated || []);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async (prospectId: string) => {
    await supabase.from("ai_prospects").update({ status: "dismissed" }).eq("id", prospectId);
    setProspects(prospects.filter(p => p.id !== prospectId));
  };

  const handleSend = async (prospectId: string) => {
    await supabase.from("ai_prospects").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", prospectId);
    toast({ title: "Message envoyé !" });
    const { data: updated } = await supabase.from("ai_prospects").select("*").order("ai_score", { ascending: false });
    setProspects(updated || []);
  };

  return (
    <div className="min-h-screen bg-background">
      <TitanNavbar userRole={profile?.role as any || "entreprise"} onLogout={async () => { await supabase.auth.signOut(); navigate("/"); }} />
      <main className="lg:pl-60 pt-14 lg:pt-0">
        <div className="p-6 max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Bot className="h-6 w-6 text-accent" /> Cockpit IA Prospection
            </h1>
            <p className="text-muted-foreground">Prospects identifiés automatiquement par l'IA</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {["", "bodacc", "insee", "job_boards", "press"].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                {s ? sourceLabels[s] || s : "Tous"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((p) => (
              <TitanCard key={p.id} variant="outlined">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TitanBadge variant="info">{sourceLabels[p.source] || p.source}</TitanBadge>
                    {p.status === "sent" && <TitanBadge variant="success">Envoyé</TitanBadge>}
                    {p.status === "validated" && <TitanBadge variant="warning">Validé</TitanBadge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${(p.ai_score || 0) > 80 ? "bg-titan-success" : (p.ai_score || 0) > 60 ? "bg-titan-warning" : "bg-destructive"}`}
                        style={{ width: `${p.ai_score}%` }} />
                    </div>
                    <span className="text-sm font-bold text-foreground">{p.ai_score}%</span>
                  </div>
                </div>
                <h3 className="font-bold text-foreground">{p.company_name}</h3>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <Zap className="h-3 w-3 text-accent" /> {p.signal_type}
                </p>
                {p.suggested_message && (
                  <p className="text-sm text-muted-foreground mt-2 bg-muted/50 rounded-lg p-3 italic line-clamp-3">
                    "{p.suggested_message}"
                  </p>
                )}
                <div className="flex gap-2 mt-4">
                  {p.status === "new" && (
                    <TitanButton size="sm" icon={<Send className="h-4 w-4" />} className="flex-1"
                      loading={actionLoading === p.id} onClick={() => handleValidate(p.id)}>
                      Valider et Générer
                    </TitanButton>
                  )}
                  {p.status === "validated" && (
                    <TitanButton size="sm" icon={<Send className="h-4 w-4" />} className="flex-1"
                      onClick={() => handleSend(p.id)}>
                      Envoyer
                    </TitanButton>
                  )}
                  {p.status !== "sent" && p.status !== "dismissed" && (
                    <TitanButton variant="ghost" size="sm" icon={<X className="h-4 w-4" />}
                      onClick={() => handleDismiss(p.id)}>
                      Ignorer
                    </TitanButton>
                  )}
                </div>
              </TitanCard>
            ))}
            {filtered.length === 0 && (
              <TitanCard variant="outlined" className="text-center py-8 col-span-2">
                <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Aucun prospect IA disponible. L'analyse est en cours.</p>
              </TitanCard>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default IAProspection;
