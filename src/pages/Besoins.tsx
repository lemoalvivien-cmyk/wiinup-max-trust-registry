import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TitanNavbar from "@/components/titan/TitanNavbar";
import TitanCard from "@/components/titan/TitanCard";
import TitanBadge from "@/components/titan/TitanBadge";
import TitanButton from "@/components/titan/TitanButton";
import TitanModal from "@/components/titan/TitanModal";
import TitanInput from "@/components/titan/TitanInput";
import TitanSelect from "@/components/titan/TitanSelect";
import { Plus, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const sectors = [
  { value: "", label: "Tous les secteurs" },
  { value: "immobilier", label: "Immobilier" },
  { value: "assurance", label: "Assurance" },
  { value: "finance", label: "Finance" },
  { value: "tech", label: "Tech / IT" },
  { value: "conseil", label: "Conseil" },
];

const mockBesoins = [
  { id: "1", title: "Recherche partenaire distribution B2B", description: "Nous cherchons un partenaire pour distribuer nos solutions SaaS...", sector_target: "tech", status: "active", intro_count: 5 },
  { id: "2", title: "Courtier assurance entreprise", description: "Besoin d'un courtier spécialisé pour notre flotte...", sector_target: "assurance", status: "active", intro_count: 3 },
  { id: "3", title: "Agent immobilier locaux professionnels", description: "Recherche d'un local de 200m² en zone...", sector_target: "immobilier", status: "paused", intro_count: 1 },
];

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "danger" }> = {
  active: { label: "Actif", variant: "success" },
  paused: { label: "Pausé", variant: "warning" },
  closed: { label: "Clos", variant: "danger" },
};

const Besoins = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const navigate = useNavigate();

  const filtered = mockBesoins.filter((b) => !filterStatus || b.status === filterStatus);

  return (
    <div className="min-h-screen bg-background">
      <TitanNavbar userRole="entreprise" onLogout={async () => { await supabase.auth.signOut(); navigate("/"); }} />
      <main className="lg:pl-60 pt-14 lg:pt-0">
        <div className="p-6 max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Mes Besoins</h1>
              <p className="text-muted-foreground">Gérez vos besoins publiés</p>
            </div>
            <TitanButton icon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
              Nouveau Besoin
            </TitanButton>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {["", "active", "paused", "closed"].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === s ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                {s ? statusConfig[s]?.label : "Tous"}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-4">
            {filtered.map((b) => (
              <TitanCard key={b.id} variant="outlined" className="cursor-pointer hover:titan-shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-foreground">{b.title}</h3>
                      <TitanBadge variant={statusConfig[b.status]?.variant}>{statusConfig[b.status]?.label}</TitanBadge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{b.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-muted-foreground">Secteur : {b.sector_target}</span>
                      <span className="text-xs text-muted-foreground">{b.intro_count} introductions</span>
                    </div>
                  </div>
                </div>
              </TitanCard>
            ))}
          </div>

          {/* Modal */}
          <TitanModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nouveau Besoin">
            <div className="space-y-4">
              <TitanInput label="Titre (120 caractères max)" placeholder="Décrivez votre besoin en une phrase" />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Description (500 caractères max)</label>
                <textarea className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]"
                  placeholder="L'IA structurera votre demande automatiquement..." />
              </div>
              <TitanSelect label="Secteur cible" options={sectors.filter((s) => s.value)} />
              <TitanButton className="w-full">Publier le besoin</TitanButton>
            </div>
          </TitanModal>
        </div>
      </main>
    </div>
  );
};

export default Besoins;
