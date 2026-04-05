import React from "react";
import { Check, Clock, Send, Calendar, Trophy, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStep {
  status: string;
  label: string;
  date?: string;
  actor?: string;
  active?: boolean;
  completed?: boolean;
}

interface TitanTimelineProps {
  steps: TimelineStep[];
}

const statusIcons: Record<string, React.ReactNode> = {
  draft: <Clock className="h-4 w-4" />,
  pending: <Send className="h-4 w-4" />,
  accepted: <Check className="h-4 w-4" />,
  meeting_scheduled: <Calendar className="h-4 w-4" />,
  won: <Trophy className="h-4 w-4" />,
  lost: <X className="h-4 w-4" />,
  rejected: <X className="h-4 w-4" />,
};

const TitanTimeline: React.FC<TitanTimelineProps> = ({ steps }) => (
  <div className="space-y-0">
    {steps.map((step, i) => (
      <div key={i} className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm",
            step.completed ? "bg-titan-success text-accent-foreground" :
            step.active ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
          )}>
            {statusIcons[step.status] || <Clock className="h-4 w-4" />}
          </div>
          {i < steps.length - 1 && <div className={cn("w-0.5 h-12", step.completed ? "bg-titan-success" : "bg-border")} />}
        </div>
        <div className="pb-8">
          <p className={cn("font-semibold text-sm", step.active ? "text-accent" : step.completed ? "text-foreground" : "text-muted-foreground")}>
            {step.label}
          </p>
          {step.date && <p className="text-xs text-muted-foreground mt-0.5">{step.date}</p>}
          {step.actor && <p className="text-xs text-muted-foreground">{step.actor}</p>}
        </div>
      </div>
    ))}
  </div>
);

export default TitanTimeline;
