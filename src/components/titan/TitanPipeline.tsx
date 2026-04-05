import React from "react";
import TitanBadge from "./TitanBadge";
import { cn } from "@/lib/utils";

interface PipelineCard {
  id: string;
  prospect_name: string;
  prospect_company: string;
  facilitateur?: string;
  score?: number;
  days_in_status?: number;
  sector?: string;
}

interface TitanPipelineProps {
  columns: { status: string; label: string; cards: PipelineCard[] }[];
  onCardClick?: (id: string) => void;
}

const statusColors: Record<string, string> = {
  draft: "border-t-muted-foreground",
  pending: "border-t-titan-warning",
  accepted: "border-t-titan-info",
  meeting_scheduled: "border-t-accent",
  won: "border-t-titan-success",
  lost: "border-t-destructive",
  rejected: "border-t-destructive",
};

const TitanPipeline: React.FC<TitanPipelineProps> = ({ columns, onCardClick }) => (
  <div className="flex gap-4 overflow-x-auto pb-4">
    {columns.map((col) => (
      <div key={col.status} className="min-w-[260px] flex-1">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-foreground">{col.label}</h4>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {col.cards.length}
          </span>
        </div>
        <div className="space-y-2">
          {col.cards.map((card) => (
            <div
              key={card.id}
              onClick={() => onCardClick?.(card.id)}
              className={cn(
                "bg-card rounded-lg p-3 border border-border border-t-2 cursor-pointer hover:titan-shadow-md transition-shadow",
                statusColors[col.status] || "border-t-border"
              )}
            >
              <p className="font-semibold text-sm text-foreground">{card.prospect_name}</p>
              <p className="text-xs text-muted-foreground">{card.prospect_company}</p>
              <div className="flex items-center justify-between mt-2">
                {card.score !== undefined && (
                  <TitanBadge variant={card.score > 70 ? "success" : card.score > 40 ? "warning" : "danger"}>
                    Score {card.score}
                  </TitanBadge>
                )}
                {card.days_in_status !== undefined && (
                  <span className="text-xs text-muted-foreground">{card.days_in_status}j</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default TitanPipeline;
