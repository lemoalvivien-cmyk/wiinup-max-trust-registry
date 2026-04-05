import React from "react";
import { cn } from "@/lib/utils";

interface TitanCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
  padding?: string;
  className?: string;
  children: React.ReactNode;
}

const variantStyles = {
  default: "bg-card rounded-xl titan-shadow-sm",
  elevated: "bg-card rounded-xl titan-shadow-lg",
  outlined: "bg-card rounded-xl border border-border",
};

const TitanCard: React.FC<TitanCardProps> = ({ variant = "default", padding = "p-6", className, children }) => (
  <div className={cn(variantStyles[variant], padding, className)}>
    {children}
  </div>
);

export default TitanCard;
