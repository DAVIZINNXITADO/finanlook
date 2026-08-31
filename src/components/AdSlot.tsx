import { cn } from "@/lib/utils";

type AdSlotSize = "banner" | "inline" | "sidebar";

/**
 * Espaço reservado para anúncios.
 *
 * Nenhum anúncio real é carregado aqui. O componente apenas
 * reserva altura para que, no futuro, uma plataforma de anúncios
 * possa ser conectada sem quebrar o layout.
 */
export function AdSlot({
  id,
  size = "banner",
  className,
}: {
  /** Identificador do espaço, usado depois pela plataforma de anúncios. */
  id: string;
  size?: AdSlotSize;
  className?: string;
}) {
  const heights: Record<AdSlotSize, string> = {
    banner: "h-20 sm:h-24",
    inline: "h-16 sm:h-20",
    sidebar: "h-40",
  };

  return (
    <div
      data-ad-slot={id}
      aria-hidden
      className={cn(
        "flex w-full max-w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted/40 px-4",
        heights[size],
        className,
      )}
    >
      <span className="truncate text-xs font-medium text-muted-foreground">
        Espaço para anúncio
      </span>
    </div>
  );
}
