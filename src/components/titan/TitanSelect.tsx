import React from "react";
import { cn } from "@/lib/utils";

interface TitanSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const TitanSelect = React.forwardRef<HTMLSelectElement, TitanSelectProps>(
  ({ label, error, options, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <select
        ref={ref}
        className={cn(
          "w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow appearance-none",
          error && "border-destructive focus:ring-destructive",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
);
TitanSelect.displayName = "TitanSelect";

export default TitanSelect;
