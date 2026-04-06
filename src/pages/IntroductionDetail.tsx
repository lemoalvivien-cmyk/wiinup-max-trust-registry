import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TitanNavbar from "@/components/titan/TitanNavbar";
import TitanTimeline from "@/components/titan/TitanTimeline";
import TitanCard from "@/components/titan/TitanCard";
import TitanBadge from "@/components/titan/TitanBadge";
import TitanButton from "@/components/titan/TitanButton";
import TitanInput from "@/components/titan/TitanInput";
import TitanSelect from "@/components/titan/TitanSelect";
import TitanProofUpload from "@/components/titan/TitanProofUpload";
import { FileCheck, CheckSquare, Shield, AlertTriangle, Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  pending: "En attente",
  accepted: "Accepté",
  meeting_scheduled: "RDV planifié",
  won: "Gagné",
  lost: "Perdu",
  rejected: "Rejeté",
};

const rejectionReasons = [
  { value: "not_relevant", label: "Pas pertinent" },
  { value: "already_in_contact", label: "Déjà en contact" },
  { value: "bad_timing", label: "Mauvais timing" },
  { value: "other", label: "Autre" },
];

/* CDC §7 — Moteur de Preuves Hiérarchisé (4 niveaux) */
const levelConfig: Record<string, { variant: "success" | "warning" | "danger" | "info"; label: string; points: number }> = {
  forte: { variant: "success", label: "Forte", points: 40 },
  moyenne: { variant: "warning", label: "Moyenne", points: 20 },
  faible: { variant: "danger", label: "Faible", points: 5 },
  suspecte: { variant: "info", label: "⚠ Suspecte", points: -30 },
};

/* CDC §7 — Seuils décisionnels */
const getScoreLabel = (score: number): { label: string; variant: "success" | "warning" | "danger"; desc: string } => {
  if (score >= 70) return { label: "Attribution automatique", variant: "success", desc: "Score ≥ 70 — Attribution automatique possible" };
  if (score >= 40) return { label: "Confirmation requise", variant: "warning", desc: "Score 40-69 — Attribution probable, confirmation manuelle requise" };
  return { label: "Arbitrage nécessaire", variant: "danger", desc: "Score < 40 — Litige probable, arbitrage nécessaire" };
};

const IntroductionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [intro, setIntro] = useState<any>(null);
  const [preuves, setPreuves] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [dealAmount, setDealAmount] = useState("");
  const [eConfirmed, setEConfirmed] = useState(false);
  const [fConfirmed, setFConfirmed] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    const { data: introData } = await supabase
      .from("introductions")
      .select("*")
      .eq("id", id)
      .single();

    const { data: preuvesData } = await supabase
      .from("preuves")
      .select("*")
      .eq("introduction_id", id)
      .order("created_at", { ascending: false });

    // Fetch audit trail for this introduction — CDC §5.6
    const { data: auditData } = await supabase
      .from("audit_log")
      .select("*")
      .eq("entity_id", id)
      .order("created_at", { ascending: false })
      .limit(20);

    setIntro(introData);
    setPreuves(preuvesData || []);
    setAuditLog(auditData || []);
    if (introData) {
      setEConfirmed(introData.entreprise_confirmed || false);
      setFConfirmed(introData.facilitateur_confirmed || false);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  /* Calculate proof score — CDC §7 */
  const proofScore = preuves.reduce((acc, p) => {
    const level = levelConfig[p.level];
    return acc + (level ? level.points : (p.points || 0));
  }, 0);

  const scoreInfo = getScoreLabel(proofScore);

  const transition = async (newStatus: string) => {
    if (!user || !id) return;
    setActionLoading(true);
    try {
      if (newStatus === "won") {
        await supabase.from("introductions").update({
          entreprise_confirmed: eConfirmed,
          facilitateur_confirmed: fConfirmed,
          deal_amount: dealAmount ? parseFloat(dealAmount) : null,
        }).eq("id", id);
      }

      if (newStatus === "rejected" && rejectionReason) {
        await supabase.from("introductions").update({
          rejection_reason: rejectionReason,
        }).eq("id", id);
      }

      const { error } = await supabase.rpc("transition_introduction_status", {
        intro_id: id,
        new_status: newStatus,
        actor_id: user.id,
      });

      if (error) {
        toast({ title: "Transition impossible", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Statut mis à jour", description: `Introduction passée en "${statusLabels[newStatus]}"` });

        // CDC §2.5 — Auto-create commission on WON (2% capped at 500€)
        if (newStatus === "won" && intro?.deal_amount && intro.deal_amount > 5000) {
          const commission = Math.min(intro.deal_amount * 0.02, 500);
          await supabase.from("commissions").insert({
            introduction_id: id,
            facilitateur_id: intro.facilitateur_id,
            amount: commission,
          });
        }

        fetchData();
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const timeline = [
    { status: "draft", label: "Brouillon", completed: true },
    { status: "pending", label: "Soumise", completed: ["pending", "accepted", "meeting_scheduled", "won"].includes(intro?.status || "") },
    { status: "accepted", label: "Acceptée", completed: ["accepted", "meeting_scheduled", "won"].includes(intro?.status || "") },
    { status: "meeting_scheduled", label: "RDV planifié", completed: ["meeting_scheduled", "won"].includes(intro?.status || ""), active: intro?.status === "meeting_scheduled" },
    { status: "won", label: "Deal gagné", completed: intro?.status === "won" },
  ];

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Chargement...</p></div>;
  if (!intro) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Introduction introuvable</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <TitanNavbar userRole={profile?.role as any || "entreprise"} onLogout={async () => { await supabase.auth.signOut(); navigate("/"); }} />
      <main className="lg:pl-60 pt-14 lg:pt-0">
        <div className="p-6 max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Introduction</h1>
              <p className="text-muted-foreground">{intro.prospect_name} — {intro.prospect_company}</p>
            </div>
            <TitanBadge variant={intro.status === "won" ? "success" : intro.status === "rejected" || intro.status === "lost" ? "danger" : "info"}>
              {statusLabels[intro.status] || intro.status}
            </TitanBadge>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Timeline */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Chronologie</h2>
              <TitanTimeline steps={timeline} />
            </div>

            {/* Preuves — CDC §7 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Preuves ({preuves.length})</h2>
                {/* CDC §7 — Score de preuve avec seuils */}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-accent">{proofScore} pts</span>
                  <TitanBadge variant={scoreInfo.variant}>{scoreInfo.label}</TitanBadge>
                </div>
              </div>

              {/* Score threshold explanation — CDC §7 */}
              <div className="bg-muted/50 rounded-lg p-3 mb-4">
                <p className="text-xs text-muted-foreground">{scoreInfo.desc}</p>
              </div>

              <div className="space-y-3 mb-4">
                {preuves.map((p) => (
                  <TitanCard key={p.id} variant="outlined" padding="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {p.level === "suspecte" ? (
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        ) : (
                          <FileCheck className="h-5 w-5 text-accent" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">{p.type.replace(/_/g, " ")}</p>
                          <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("fr-FR")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TitanBadge variant={levelConfig[p.level]?.variant || "info"}>
                          {levelConfig[p.level]?.label || p.level}
                        </TitanBadge>
                        <span className={`text-sm font-bold ${p.level === "suspecte" ? "text-destructive" : "text-accent"}`}>
                          {levelConfig[p.level]?.points > 0 ? "+" : ""}{levelConfig[p.level]?.points || p.points} pts
                        </span>
                      </div>
                    </div>
                    {/* CDC §5.6 / §6.5 — SHA-256 hash display */}
                    {p.sha256_hash && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        <code className="text-[10px] text-muted-foreground font-mono break-all">{p.sha256_hash}</code>
                      </div>
                    )}
                  </TitanCard>
                ))}
              </div>
              <TitanProofUpload introductionId={id!} onUploaded={fetchData} />
            </div>
          </div>

          {/* Actions — CDC §5 State Machine */}
          <TitanCard variant="outlined">
            <h3 className="text-lg font-bold text-foreground mb-4">Actions</h3>

            <div className="flex flex-wrap gap-3 mb-6">
              {intro.status === "pending" && (
                <>
                  <TitanButton size="sm" loading={actionLoading} onClick={() => transition("accepted")}>Accepter</TitanButton>
                  <div className="flex items-center gap-2">
                    <TitanSelect options={rejectionReasons} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
                    <TitanButton variant="danger" size="sm" loading={actionLoading} disabled={!rejectionReason} onClick={() => transition("rejected")}>Rejeter</TitanButton>
                  </div>
                </>
              )}
              {intro.status === "accepted" && (
                <TitanButton size="sm" loading={actionLoading} onClick={() => transition("meeting_scheduled")}
                  disabled={intro.proof_count < 1}>
                  Planifier RDV {intro.proof_count < 1 && "(1 preuve requise)"}
                </TitanButton>
              )}
              {intro.status !== "won" && intro.status !== "lost" && intro.status !== "rejected" && (
                <TitanButton variant="danger" size="sm" loading={actionLoading} onClick={() => transition("lost")}>Abandonner</TitanButton>
              )}
            </div>

            {/* Double confirmation for WON — CDC §5.4 */}
            {intro.status === "meeting_scheduled" && (
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" /> Double confirmation pour WON
                </h4>
                <TitanInput label="Montant du deal (€)" type="number" value={dealAmount}
                  onChange={(e) => setDealAmount(e.target.value)} placeholder="Ex: 15000" />
                <div className="space-y-2 mt-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={eConfirmed} onChange={(e) => setEConfirmed(e.target.checked)}
                      className="w-4 h-4 rounded border-border accent-accent" />
                    <span className="text-foreground">Confirmation Entreprise</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={fConfirmed} onChange={(e) => setFConfirmed(e.target.checked)}
                      className="w-4 h-4 rounded border-border accent-accent" />
                    <span className="text-foreground">Confirmation Facilitateur</span>
                  </label>
                </div>
                <TitanButton className="mt-4" disabled={!eConfirmed || !fConfirmed} loading={actionLoading}
                  size="sm" onClick={() => transition("won")}>
                  Confirmer Deal Gagné
                </TitanButton>
              </div>
            )}
          </TitanCard>

          {/* Audit Trail — CDC §5.6 SHA-256 */}
          <TitanCard variant="outlined">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" /> Audit Trail SHA-256
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Chaque action est horodatée et hashée. Opposable en litige.</p>
            {auditLog.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {auditLog.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                    <div className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{log.action}</p>
                      <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString("fr-FR")}</p>
                      {log.sha256_hash && (
                        <code className="text-[10px] text-muted-foreground font-mono break-all block mt-0.5">
                          SHA-256: {log.sha256_hash}
                        </code>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Audit trail en cours de génération...</p>
            )}
          </TitanCard>
        </div>
      </main>
    </div>
  );
};

export default IntroductionDetail;
