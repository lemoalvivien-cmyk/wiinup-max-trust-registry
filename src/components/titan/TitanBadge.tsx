import React from "react";
import { cn } from "@/lib/utils";

interface TitanBadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "founder";
  className?: string;
  children: React.ReactNode;
}

const variantStyles = {
  success: "bg-titan-success/10 text-titan-success border-titan-success/20",
  warning: "bg-titan-warning/10 text-titan-warning border-titan-warning/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-titan-info/10 text-titan-info border-titan-info/20",
  founder: "titan-gradient-gold text-primary border-transparent font-bold",
};

const TitanBadge: React.FC<TitanBadgeProps> = ({ variant = "info", className, children }) => (
  <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", variantStyles[variant], className)}>
    {children}
  </span>
);

export default TitanBadge;
