import React from "react";
import { useNavigate } from "react-router-dom";
import TitanNavbar from "@/components/titan/TitanNavbar";
import TitanPipeline from "@/components/titan/TitanPipeline";
import { supabase } from "@/integrations/supabase/client";

const mockCards = {
  draft: [
    { id: "d1", prospect_name: "Alice Martin", prospect_company: "DataFlow", score: 45, days_in_status: 1 },
  ],
  pending: [
    { id: "p1", prospect_name: "Jean Dupont", prospect_company: "TechCorp", score: 60, days_in_status: 2 },
    { id: "p2", prospect_name: "Luc Renard", prospect_company: "InnoSoft", score: 55, days_in_status: 4 },
  ],
  accepted: [
    { id: "a1", prospect_name: "Marie Leroy", prospect_company: "FinServices", score: 78, days_in_status: 3 },
  ],
  meeting_scheduled: [
    { id: "m1", prospect_name: "Paul Bernard", prospect_company: "ImmoPlus", score: 85, days_in_status: 1 },
  ],
  won: [
    { id: "w1", prospect_name: "Sophie Blanc", prospect_company: "ConsultPro", score: 95, days_in_status: 0 },
  ],
  lost: [
    { id: "l1", prospect_name: "Éric Noir", prospect_company: "OldCo", score: 20, days_in_status: 10 },
  ],
};

const columns = [
  { status: "draft", label: "Brouillon", cards: mockCards.draft },
  { status: "pending", label: "En attente", cards: mockCards.pending },
  { status: "accepted", label: "Accepté", cards: mockCards.accepted },
  { status: "meeting_scheduled", label: "RDV planifié", cards: mockCards.meeting_scheduled },
  { status: "won", label: "Gagné ✓", cards: mockCards.won },
  { status: "lost", label: "Perdu / Rejeté", cards: mockCards.lost },
];

const Pipeline = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <TitanNavbar userRole="entreprise" onLogout={async () => { await supabase.auth.signOut(); navigate("/"); }} />
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
