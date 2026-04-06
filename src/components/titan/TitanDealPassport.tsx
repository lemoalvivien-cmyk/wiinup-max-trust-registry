import React from "react";
import { Shield, Award, ExternalLink, Download, QrCode } from "lucide-react";

interface ProofItem {
  type: string;
  hash: string;
  created_at: string;
}

interface TitanDealPassportProps {
  introduction: {
    id: string;
    prospect_name: string;
    prospect_company: string;
    status: string;
    deal_amount: number;
    created_at: string;
    updated_at: string;
  };
  proofs: ProofItem[];
  facilitateur: {
    full_name: string;
    reputation_score: number;
  };
}

const TitanDealPassport: React.FC<TitanDealPassportProps> = ({ introduction, proofs, facilitateur }) => {
  const formattedAmount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(introduction.deal_amount);

  const hashPreview = introduction.id.replace(/-/g, "").substring(0, 16);
  const createdDate = new Date(introduction.created_at).toLocaleDateString("fr-FR");
  const updatedDate = new Date(introduction.updated_at).toLocaleDateString("fr-FR");
  const verifyUrl = `https://wiinup.fr/verify/${introduction.id}`;

  const statusLabel: Record<string, string> = {
    won: "GAGNÉ",
    accepted: "ACCEPTÉ",
    meeting_scheduled: "RDV PLANIFIÉ",
    pending: "EN ATTENTE",
  };

  const statusColor: Record<string, string> = {
    won: "bg-green-100 text-green-800",
    accepted: "bg-blue-100 text-blue-800",
    meeting_scheduled: "bg-yellow-100 text-yellow-800",
    pending: "bg-gray-100 text-gray-800",
  };

  const handleLinkedInShare = () => {
    const text = encodeURIComponent(
      `Deal validé avec ${introduction.prospect_company} (${formattedAmount}) via @WIINUP — Registre de confiance B2B. Certificat vérifiable : ${verifyUrl}`
    );
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`, "_blank");
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div id="deal-passport" className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden print:shadow-none">
        {/* Header Navy */}
        <div className="bg-[#0D254F] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FF6C0A] flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Deal Passport</h1>
              <p className="text-blue-200 text-xs">Certificat d'affaire WIINUP</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor[introduction.status] || statusColor.pending}`}>
            {statusLabel[introduction.status] || introduction.status.toUpperCase()}
          </span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Deal info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Prospect</p>
              <p className="font-bold text-gray-900">{introduction.prospect_name}</p>
              <p className="text-sm text-gray-600">{introduction.prospect_company}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Montant</p>
              <p className="text-2xl font-black text-[#FF6C0A]">{formattedAmount}</p>
            </div>
          </div>

          {/* Facilitateur */}
          <div className="bg-blue-50 border-l-4 border-[#0D254F] p-4 rounded-r-lg flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#0D254F] flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">{facilitateur.full_name}</p>
              <p className="text-xs text-gray-600">Facilitateur · Réputation {facilitateur.reputation_score}/100</p>
            </div>
            <Award className="w-5 h-5 text-[#FF6C0A]" />
          </div>

          {/* Preuves */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Preuves ({proofs.length})</p>
            <div className="space-y-1.5">
              {proofs.map((proof, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded text-sm">
                  <span className="text-gray-700">{proof.type}</span>
                  <code className="text-xs text-gray-400">{proof.hash.substring(0, 16)}…</code>
                </div>
              ))}
              {proofs.length === 0 && <p className="text-sm text-gray-400 italic">Aucune preuve enregistrée</p>}
            </div>
          </div>

          {/* Hash + Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500 mb-1">SHA-256</p>
              <code className="text-xs text-gray-700 break-all">{hashPreview}…</code>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500 mb-1">Timeline</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-700">{createdDate}</span>
                <span className="text-gray-400">→</span>
                <span className="text-gray-700">{updatedDate}</span>
                <span className="text-gray-400">→</span>
                <span className="font-bold text-green-600">✓</span>
              </div>
            </div>
          </div>

          {/* QR Code placeholder */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center">
            <QrCode className="w-10 h-10 text-gray-300 mb-2" />
            <p className="text-xs text-gray-500">{verifyUrl}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 print:hidden">
            <button
              onClick={handleLinkedInShare}
              className="flex-1 flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#084d93] text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition"
            >
              <ExternalLink className="w-4 h-4" />
              Partager sur LinkedIn
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 bg-[#FF6C0A] hover:bg-[#e55f00] text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition"
            >
              <Download className="w-4 h-4" />
              Télécharger
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t px-6 py-3 text-center">
          <p className="text-xs text-gray-400">© 2026 WIINUP — Registre de confiance transactionnelle B2B</p>
        </div>
      </div>

      <style>{`@media print { body * { visibility: hidden; } #deal-passport, #deal-passport * { visibility: visible; } #deal-passport { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>
    </div>
  );
};

export default TitanDealPassport;
