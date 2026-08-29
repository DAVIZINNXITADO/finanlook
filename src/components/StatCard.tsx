import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  tone?: "neutral" | "positive" | "negative" | "info";
};

const toneClasses: Record<NonNullable<Props["tone"]>, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  positive: "bg-success/15 text-success",
  negative: "bg-destructive/12 text-destructive",
  info: "bg-info/12 text-info",
};

export function StatCard({ label, value, hint, icon, tone = "neutral" }: Props) {
  return (
    <div className="surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon ? (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              toneClasses[tone],
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
