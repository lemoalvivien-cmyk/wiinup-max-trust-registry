import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TitanNavbar from "@/components/titan/TitanNavbar";
import TitanCard from "@/components/titan/TitanCard";
import TitanBadge from "@/components/titan/TitanBadge";
import TitanButton from "@/components/titan/TitanButton";
import { Bot, Zap, Send, X, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const mockProspects = [
  { id: "1", company: "NovaTech SAS", source: "bodacc", signal: "Augmentation de capital +500k€", score: 91, message: "Bonjour, suite à votre augmentation de capital récente, nous pensons que nos solutions de...", status: "new" },
  { id: "2", company: "GreenBuild SARL", source: "job_boards", signal: "Recrutement 15 postes commerciaux", score: 87, message: "Votre expansion commerciale correspond parfaitement à notre réseau de facilitateurs...", status: "new" },
  { id: "3", company: "DigiConsult", source: "insee", signal: "Création d'entreprise", score: 73, message: "Félicitations pour la création de DigiConsult. En tant que nouvelle entreprise...", status: "validated" },
  { id: "4", company: "MediaGroup SA", source: "press", signal: "Nouveau PDG nommé", score: 68, message: "Suite au changement de direction, nous vous proposons de découvrir...", status: "sent" },
  { id: "5", company: "LogiTrans Express", source: "bodacc", signal: "Ouverture nouvelle filiale", score: 82, message: "Votre expansion géographique est une opportunité idéale pour...", status: "new" },
];

const sourceLabels: Record<string, string> = {
  bodacc: "BODACC", pappers: "Pappers", insee: "INSEE", press: "Presse", job_boards: "Job Boards",
};

const IAProspection = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const [prospects, setProspects] = useState(mockProspects);

  const filtered = prospects.filter((p) => !filter || p.source === filter);

  return (
    <div className="min-h-screen bg-background">
      <TitanNavbar userRole="entreprise" onLogout={async () => { await supabase.auth.signOut(); navigate("/"); }} />
      <main className="lg:pl-60 pt-14 lg:pt-0">
        <div className="p-6 max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Bot className="h-6 w-6 text-accent" /> Cockpit IA Prospection
            </h1>
            <p className="text-muted-foreground">Prospects identifiés automatiquement par l'IA</p>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {["", "bodacc", "insee", "job_boards", "press"].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                {s ? sourceLabels[s] || s : "Tous"}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((p) => (
              <TitanCard key={p.id} variant="outlined">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TitanBadge variant="info">{sourceLabels[p.source]}</TitanBadge>
                    {p.status === "sent" && <TitanBadge variant="success">Envoyé</TitanBadge>}
                    {p.status === "validated" && <TitanBadge variant="warning">Validé</TitanBadge>}
                  </div>
                  {/* Score gauge */}
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${p.score > 80 ? "bg-titan-success" : p.score > 60 ? "bg-titan-warning" : "bg-destructive"}`}
                        style={{ width: `${p.score}%` }} />
                    </div>
                    <span className="text-sm font-bold text-foreground">{p.score}%</span>
                  </div>
                </div>
                <h3 className="font-bold text-foreground">{p.company}</h3>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <Zap className="h-3 w-3 text-accent" /> {p.signal}
                </p>
                <p className="text-sm text-muted-foreground mt-2 bg-muted/50 rounded-lg p-3 italic">
                  "{p.message}"
                </p>
                <div className="flex gap-2 mt-4">
                  <TitanButton size="sm" icon={<Send className="h-4 w-4" />} className="flex-1">
                    Valider et Envoyer
                  </TitanButton>
                  <TitanButton variant="ghost" size="sm" icon={<X className="h-4 w-4" />}>
                    Ignorer
                  </TitanButton>
                </div>
              </TitanCard>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default IAProspection;
