import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TitanNavbar from "@/components/titan/TitanNavbar";
import TitanTimeline from "@/components/titan/TitanTimeline";
import TitanCard from "@/components/titan/TitanCard";
import TitanBadge from "@/components/titan/TitanBadge";
import TitanButton from "@/components/titan/TitanButton";
import { FileCheck, Upload, CheckSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const mockTimeline = [
  { status: "draft", label: "Brouillon créé", date: "1 Avr 2026", actor: "Marc (Facilitateur)", completed: true },
  { status: "pending", label: "Introduction soumise", date: "2 Avr 2026", actor: "Marc (Facilitateur)", completed: true },
  { status: "accepted", label: "Acceptée par l'entreprise", date: "3 Avr 2026", actor: "Sophie (Entreprise)", completed: true },
  { status: "meeting_scheduled", label: "RDV planifié", date: "5 Avr 2026", actor: "Système", active: true, completed: false },
  { status: "won", label: "Deal gagné", completed: false },
];

const mockPreuves = [
  { id: "1", type: "calendar_rdv", level: "forte", points: 30, date: "3 Avr 2026" },
  { id: "2", type: "email_forward", level: "moyenne", points: 15, date: "2 Avr 2026" },
  { id: "3", type: "form_accept", level: "forte", points: 25, date: "3 Avr 2026" },
];

const levelConfig: Record<string, { variant: "success" | "warning" | "danger" | "info" }> = {
  forte: { variant: "success" },
  moyenne: { variant: "warning" },
  faible: { variant: "danger" },
  suspecte: { variant: "danger" },
};

const IntroductionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eConfirmed, setEConfirmed] = useState(false);
  const [fConfirmed, setFConfirmed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <TitanNavbar userRole="entreprise" onLogout={async () => { await supabase.auth.signOut(); navigate("/"); }} />
      <main className="lg:pl-60 pt-14 lg:pt-0">
        <div className="p-6 max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Introduction #{id?.slice(0, 4)}</h1>
              <p className="text-muted-foreground">Paul Bernard — ImmoPlus</p>
            </div>
            <TitanBadge variant="info">RDV planifié</TitanBadge>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Timeline */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Chronologie</h2>
              <TitanTimeline steps={mockTimeline} />
            </div>

            {/* Preuves */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Preuves ({mockPreuves.length})</h2>
              <div className="space-y-3">
                {mockPreuves.map((p) => (
                  <TitanCard key={p.id} variant="outlined" padding="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileCheck className="h-5 w-5 text-accent" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{p.type.replace(/_/g, " ")}</p>
                          <p className="text-xs text-muted-foreground">{p.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TitanBadge variant={levelConfig[p.level]?.variant}>{p.level}</TitanBadge>
                        <span className="text-sm font-bold text-accent">+{p.points} pts</span>
                      </div>
                    </div>
                  </TitanCard>
                ))}
              </div>
              <TitanButton variant="ghost" size="sm" icon={<Upload className="h-4 w-4" />} className="mt-3 w-full">
                Ajouter une preuve
              </TitanButton>
            </div>
          </div>

          {/* Actions */}
          <TitanCard variant="outlined">
            <h3 className="text-lg font-bold text-foreground mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3 mb-6">
              <TitanButton size="sm">Accepter</TitanButton>
              <TitanButton variant="secondary" size="sm">Planifier RDV</TitanButton>
              <TitanButton variant="danger" size="sm">Rejeter</TitanButton>
            </div>

            {/* Double confirmation */}
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <CheckSquare className="h-4 w-4" /> Double confirmation pour WON
              </h4>
              <div className="space-y-2">
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
              <TitanButton className="mt-4" disabled={!eConfirmed || !fConfirmed} size="sm">
                Confirmer Deal Gagné
              </TitanButton>
            </div>
          </TitanCard>
        </div>
      </main>
    </div>
  );
};

export default IntroductionDetail;
