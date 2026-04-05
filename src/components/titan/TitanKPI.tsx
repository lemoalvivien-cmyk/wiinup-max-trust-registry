import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import TitanCard from "./TitanCard";

interface TitanKPIProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
}

const trendConfig = {
  up: { icon: TrendingUp, color: "text-titan-success" },
  down: { icon: TrendingDown, color: "text-destructive" },
  neutral: { icon: Minus, color: "text-muted-foreground" },
};

const TitanKPI: React.FC<TitanKPIProps> = ({ label, value, trend = "neutral", trendValue, icon }) => {
  const TrendIcon = trendConfig[trend].icon;
  return (
    <TitanCard className="flex items-start gap-4">
      {icon && <div className="p-2 rounded-lg bg-accent/10 text-accent">{icon}</div>}
      <div className="flex-1">
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
        {trendValue && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trendConfig[trend].color}`}>
            <TrendIcon className="h-4 w-4" />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </TitanCard>
  );
};

export default TitanKPI;
