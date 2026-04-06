import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TitanNavbar from "@/components/titan/TitanNavbar";
import TitanCard from "@/components/titan/TitanCard";
import TitanBadge from "@/components/titan/TitanBadge";
import TitanButton from "@/components/titan/TitanButton";
import TitanModal from "@/components/titan/TitanModal";
import TitanInput from "@/components/titan/TitanInput";
import TitanSelect from "@/components/titan/TitanSelect";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const sectors = [
  { value: "immobilier", label: "Immobilier" },
  { value: "assurance", label: "Assurance" },
  { value: "finance", label: "Finance" },
  { value: "tech", label: "Tech / IT" },
  { value: "conseil", label: "Conseil" },
  { value: "btp", label: "BTP" },
  { value: "sante", label: "Santé" },
  { value: "autre", label: "Autre" },
];

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "danger" }> = {
  active: { label: "Actif", variant: "success" },
  paused: { label: "Pausé", variant: "warning" },
  closed: { label: "Clos", variant: "danger" },
};

const Besoins = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [besoins, setBesoins] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sectorTarget, setSectorTarget] = useState("");
  const [saving, setSaving] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchBesoins = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("besoins")
      .select("*")
      .order("created_at", { ascending: false });
    setBesoins(data || []);
  };

  useEffect(() => { fetchBesoins(); }, [user]);

  const handleCreate = async () => {
    if (!user || !title || !description || !sectorTarget) return;
    setSaving(true);
    const { error } = await supabase.from("besoins").insert({
      entreprise_id: user.id,
      title: title.slice(0, 120),
      description: description.slice(0, 500),
      sector_target: sectorTarget,
    });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Besoin publié !" });
      setModalOpen(false);
      setTitle(""); setDescription(""); setSectorTarget("");
      fetchBesoins();
    }
    setSaving(false);
  };

  const filtered = besoins.filter((b) => !filterStatus || b.status === filterStatus);

  return (
    <div className="min-h-screen bg-background">
      <TitanNavbar userRole={profile?.role as any || "entreprise"} onLogout={async () => { await supabase.auth.signOut(); navigate("/"); }} />
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

          <div className="flex gap-2">
            {["", "active", "paused", "closed"].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === s ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                {s ? statusConfig[s]?.label : "Tous"}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filtered.map((b) => (
              <TitanCard key={b.id} variant="outlined" className="cursor-pointer hover:titan-shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-foreground">{b.title}</h3>
                      <TitanBadge variant={statusConfig[b.status]?.variant || "info"}>{statusConfig[b.status]?.label || b.status}</TitanBadge>
                      {b.is_phantom && <TitanBadge variant="info">Généré par IA</TitanBadge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{b.description}</p>
                    <span className="text-xs text-muted-foreground mt-2 block">Secteur : {b.sector_target}</span>
                  </div>
                </div>
              </TitanCard>
            ))}
            {filtered.length === 0 && (
              <TitanCard variant="outlined" className="text-center py-8">
                <p className="text-muted-foreground">Aucun besoin. Créez votre premier besoin pour recevoir des introductions.</p>
              </TitanCard>
            )}
          </div>

          <TitanModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nouveau Besoin">
            <div className="space-y-4">
              <TitanInput label="Titre (120 caractères max)" value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 120))}
                placeholder="Décrivez votre besoin en une phrase" />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Description (500 caractères max)</label>
                <textarea className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]"
                  value={description} onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                  placeholder="L'IA structurera votre demande automatiquement..." />
                <p className="text-xs text-muted-foreground text-right">{description.length}/500</p>
              </div>
              <TitanSelect label="Secteur cible" options={sectors} value={sectorTarget} onChange={(e) => setSectorTarget(e.target.value)} />
              <TitanButton className="w-full" loading={saving} onClick={handleCreate} disabled={!title || !description || !sectorTarget}>
                Publier le besoin
              </TitanButton>
            </div>
          </TitanModal>
        </div>
      </main>
    </div>
  );
};

export default Besoins;
