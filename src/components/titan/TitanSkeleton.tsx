import React from "react";
import { cn } from "@/lib/utils";

interface TitanSkeletonProps {
  className?: string;
  variant?: "text" | "card" | "kpi" | "avatar";
}

const TitanSkeleton: React.FC<TitanSkeletonProps> = ({ className, variant = "text" }) => {
  if (variant === "card") {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-6 space-y-3 animate-pulse", className)}>
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>
    );
  }
  if (variant === "kpi") {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-6 animate-pulse", className)}>
        <div className="h-3 bg-muted rounded w-1/3 mb-3" />
        <div className="h-8 bg-muted rounded w-1/2" />
      </div>
    );
  }
  if (variant === "avatar") {
    return <div className={cn("rounded-full bg-muted animate-pulse w-10 h-10", className)} />;
  }
  return <div className={cn("h-4 bg-muted rounded animate-pulse", className)} />;
};

export default TitanSkeleton;
