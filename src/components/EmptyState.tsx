import type { ReactNode } from "react";

type Props = {
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ emoji = "🌱", title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center">
      <span className="text-4xl" aria-hidden>
        {emoji}
      </span>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      {description ? (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
