import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TitanNavbar from "@/components/titan/TitanNavbar";
import TitanPipeline from "@/components/titan/TitanPipeline";
import TitanCard from "@/components/titan/TitanCard";
import TitanBadge from "@/components/titan/TitanBadge";
import { Lock, Unlock, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Pipeline = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [columns, setColumns] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchIntros = async () => {
      const { data } = await supabase
        .from("introductions")
        .select("*")
        .order("updated_at", { ascending: false });

      const statuses = ["draft", "pending", "accepted", "meeting_scheduled", "won", "lost"];
      const labels: Record<string, string> = {
        draft: "Brouillon", pending: "En attente", accepted: "Accepté",
        meeting_scheduled: "RDV planifié", won: "Gagné ✓", lost: "Perdu / Rejeté",
      };

      /* CDC §6.1 — Lead Capsule: contacts masked until ACCEPTED */
      const contactVisibleStatuses = ["accepted", "meeting_scheduled", "won"];

      const grouped = statuses.map((status) => ({
        status,
        label: labels[status],
        /* CDC §6.1 — Show lock icon for pre-accepted statuses */
        contactsLocked: !contactVisibleStatuses.includes(status),
        cards: (data || [])
          .filter((i) => {
            if (status === "lost") return i.status === "lost" || i.status === "rejected";
            return i.status === status;
          })
          .map((i) => ({
            id: i.id,
            prospect_name: contactVisibleStatuses.includes(i.status) ? i.prospect_name : `${(i.prospect_name || "")[0] || "?"}***`,
            prospect_company: contactVisibleStatuses.includes(i.status) ? i.prospect_company : "Contact masqué",
            score: i.proof_count ? i.proof_count * 20 : 0,
            days_in_status: Math.floor((Date.now() - new Date(i.updated_at).getTime()) / (1000 * 60 * 60 * 24)),
            contactsVisible: contactVisibleStatuses.includes(i.status),
          })),
      }));

      setColumns(grouped);
    };

    fetchIntros();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <TitanNavbar userRole={profile?.role as any || "entreprise"} onLogout={async () => { await supabase.auth.signOut(); navigate("/"); }} />
      <main className="lg:pl-60 pt-14 lg:pt-0">
        <div className="p-6 max-w-full mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Pipeline Introductions</h1>
              <p className="text-muted-foreground">Suivez vos introductions en temps réel — 6 colonnes State Machine</p>
            </div>
          </div>

          {/* CDC §6.1 — Lead Capsule indicator */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" /> Contacts masqués (Brouillon, En attente)
            </span>
            <span className="flex items-center gap-1">
              <Unlock className="h-3 w-3 text-titan-success" /> Contacts visibles (Accepté+)
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-accent" /> Preuves SHA-256
            </span>
          </div>

          <TitanPipeline columns={columns} onCardClick={(id) => navigate(`/introductions/${id}`)} />
        </div>
      </main>
    </div>
  );
};

export default Pipeline;
