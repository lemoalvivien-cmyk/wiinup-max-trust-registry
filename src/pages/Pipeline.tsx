import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TitanNavbar from "@/components/titan/TitanNavbar";
import TitanPipeline from "@/components/titan/TitanPipeline";
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

      const grouped = statuses.map((status) => ({
        status,
        label: labels[status],
        cards: (data || [])
          .filter((i) => {
            if (status === "lost") return i.status === "lost" || i.status === "rejected";
            return i.status === status;
          })
          .map((i) => ({
            id: i.id,
            prospect_name: i.prospect_name,
            prospect_company: i.prospect_company,
            score: i.proof_count ? i.proof_count * 20 : 0,
            days_in_status: Math.floor((Date.now() - new Date(i.updated_at).getTime()) / (1000 * 60 * 60 * 24)),
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
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pipeline Introductions</h1>
            <p className="text-muted-foreground">Suivez vos introductions en temps réel</p>
          </div>
          <TitanPipeline columns={columns} onCardClick={(id) => navigate(`/introductions/${id}`)} />
        </div>
      </main>
    </div>
  );
};

export default Pipeline;
