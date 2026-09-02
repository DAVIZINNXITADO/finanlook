import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  RefreshCw,
} from "lucide-react";

import {
  cn,
} from "@/lib/utils";

/* =========================================================
   TIPOS
   ========================================================= */

type AdSlotSize =
  | "banner"
  | "inline"
  | "sidebar";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export const AD_CLIENT =
  "ca-pub-8390455641519303";

const AD_SLOT_ID =
  "5029040323";

/* =========================================================
   ATUALIZAÇÃO MANUAL (apenas visual, para testes internos)
   ========================================================= */

const REFRESH_EVENT =
  "finanlook:ad-slots-refresh";

/**
 * Força a remontagem dos espaços reservados.
 * Serve apenas para conferir o layout durante o desenvolvimento —
 * não gera impressões, cliques nem qualquer tráfego artificial.
 */
export function refreshAdSlots() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new Event(REFRESH_EVENT),
  );
}

const HEIGHTS: Record<AdSlotSize, string> = {
  banner: "min-h-[96px]",
  inline: "min-h-[120px]",
  sidebar: "min-h-[200px]",
};

/* =========================================================
   COMPONENTE
   ========================================================= */

export function AdSlot({
  id,
  size = "banner",
  className,
}: {
  id: string;
  size?: AdSlotSize;
  className?: string;
}) {
  const [
    version,
    setVersion,
  ] = useState(0);

  const [
    filled,
    setFilled,
  ] = useState(false);

  const insRef =
    useRef<HTMLModElement | null>(null);

  const bump = useCallback(() => {
    setFilled(false);

    setVersion(
      (current) => current + 1,
    );
  }, []);

  useEffect(() => {
    window.addEventListener(
      REFRESH_EVENT,
      bump,
    );

    return () => {
      window.removeEventListener(
        REFRESH_EVENT,
        bump,
      );
    };
  }, [bump]);

  useEffect(() => {
    try {
      window.adsbygoogle =
        window.adsbygoogle || [];

      window.adsbygoogle.push({});
    } catch {
      /*
       * Se o AdSense não estiver disponível,
       * mantemos apenas o espaço reservado.
       */
    }

    const element = insRef.current;

    const timeout = window.setTimeout(() => {
      const status =
        element?.getAttribute(
          "data-ad-status",
        );

      setFilled(status === "filled");
    }, 1800);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [version]);

  return (
    <div
      data-ad-slot-id={id}
      aria-label="Área de publicidade"
      className={cn(
        "relative w-full max-w-full overflow-hidden rounded-2xl border border-border/70 bg-muted/30",
        HEIGHTS[size],
        className,
      )}
    >
      {!filled ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
          <span className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
            Publicidade
          </span>
        </div>
      ) : null}

      {import.meta.env.DEV ? (
        <button
          type="button"
          onClick={refreshAdSlots}
          aria-label="Atualizar visualização dos espaços de anúncio"
          className="absolute right-2 top-2 z-10 flex size-7 items-center justify-center rounded-lg border border-border bg-background/80 text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCw className="size-3.5" />
        </button>
      ) : null}

      <ins
        key={version}
        ref={insRef}
        className="adsbygoogle block h-full w-full"
        style={{
          display: "block",
        }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT_ID}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
