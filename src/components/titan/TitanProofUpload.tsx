import React, { useState, useCallback } from "react";
import { Upload, FileCheck, X } from "lucide-react";
import TitanButton from "./TitanButton";
import TitanBadge from "./TitanBadge";
import TitanSelect from "./TitanSelect";
import { supabase } from "@/integrations/supabase/client";

interface TitanProofUploadProps {
  introductionId: string;
  onUploaded?: () => void;
}

const proofTypes = [
  { value: "calendar_rdv", label: "Confirmation calendrier RDV" },
  { value: "email_forward", label: "Email transféré" },
  { value: "form_accept", label: "Formulaire d'acceptation" },
  { value: "screenshot", label: "Capture d'écran" },
  { value: "invoice", label: "Facture" },
  { value: "docusign", label: "Document signé" },
  { value: "rdv_declare", label: "Déclaration de RDV" },
];

const levelPoints: Record<string, { level: string; points: number }> = {
  calendar_rdv: { level: "forte", points: 30 },
  form_accept: { level: "forte", points: 25 },
  docusign: { level: "forte", points: 35 },
  invoice: { level: "forte", points: 30 },
  email_forward: { level: "moyenne", points: 15 },
  rdv_declare: { level: "moyenne", points: 10 },
  screenshot: { level: "faible", points: 5 },
};

async function computeSHA256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const TitanProofUpload: React.FC<TitanProofUploadProps> = ({ introductionId, onUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [proofType, setProofType] = useState("calendar_rdv");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const validateFile = (f: File): string | null => {
    if (!ALLOWED_TYPES.includes(f.type)) return "Type non accepté. Seuls JPEG, PNG et PDF sont autorisés.";
    if (f.size > MAX_SIZE) return "Fichier trop volumineux (max 5 MB).";
    return null;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const err = validateFile(droppedFile);
      if (err) { alert(err); return; }
      setFile(droppedFile);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      const sha256 = await computeSHA256(file);
      const filePath = `${introductionId}/${Date.now()}_${file.name}`;

      const { error: storageError } = await supabase.storage
        .from("proofs")
        .upload(filePath, file);

      if (storageError) throw storageError;

      const { data: urlData } = supabase.storage.from("proofs").getPublicUrl(filePath);
      const config = levelPoints[proofType] || { level: "faible", points: 5 };

      const { error: insertError } = await supabase.from("preuves").insert({
        introduction_id: introductionId,
        type: proofType,
        level: config.level,
        points: config.points,
        file_url: urlData.publicUrl,
        sha256_hash: sha256,
      });

      if (insertError) throw insertError;

      // Update proof_count
      const { data: intro } = await supabase
        .from("introductions")
        .select("proof_count")
        .eq("id", introductionId)
        .single();

      await supabase
        .from("introductions")
        .update({ proof_count: (intro?.proof_count || 0) + 1 })
        .eq("id", introductionId);

      setFile(null);
      onUploaded?.();
    } catch (error: any) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <TitanSelect
        label="Type de preuve"
        options={proofTypes}
        value={proofType}
        onChange={(e) => setProofType(e.target.value)}
      />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
          dragOver ? "border-accent bg-accent/5" : "border-border"
        }`}
        onClick={() => document.getElementById("proof-file-input")?.click()}
      >
        <input
          id="proof-file-input"
          type="file"
          className="hidden"
          accept="image/*,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {file ? (
          <div className="flex items-center justify-center gap-2">
            <FileCheck className="h-5 w-5 text-titan-success" />
            <span className="text-sm font-medium text-foreground">{file.name}</span>
            <button onClick={(e) => { e.stopPropagation(); setFile(null); }}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Glissez un fichier ici ou cliquez pour sélectionner
            </p>
            <p className="text-xs text-muted-foreground mt-1">Images et PDF acceptés</p>
          </>
        )}
      </div>

      {file && (
        <div className="flex items-center justify-between">
          <TitanBadge variant={levelPoints[proofType]?.level === "forte" ? "success" : levelPoints[proofType]?.level === "moyenne" ? "warning" : "danger"}>
            {levelPoints[proofType]?.level} • +{levelPoints[proofType]?.points} pts
          </TitanBadge>
          <TitanButton size="sm" loading={uploading} onClick={handleUpload}>
            Uploader la preuve
          </TitanButton>
        </div>
      )}
    </div>
  );
};

export default TitanProofUpload;
