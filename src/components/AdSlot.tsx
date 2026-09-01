import {
  useEffect,
  useState,
} from "react";

import {
  cn,
} from "@/lib/utils";

type AdSlotSize =
  | "banner"
  | "inline"
  | "sidebar";

declare global {
  interface Window {
    adsbygoogle:
      unknown[];
  }
}

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
    adLoaded,
    setAdLoaded,
  ] = useState(false);

  useEffect(() => {
    try {
      (
        window.adsbygoogle =
          window.adsbygoogle ||
          []
      ).push({});

      /*
       * O AdSense injeta conteúdo dentro
       * do elemento <ins>.
       *
       * Mantemos o espaço reservado inicialmente.
       */
      const timeout =
        window.setTimeout(() => {
          setAdLoaded(true);
        }, 1500);

      return () => {
        window.clearTimeout(
          timeout,
        );
      };
    } catch {
      /*
       * Se o AdSense falhar, o placeholder
       * continua aparecendo e a página não quebra.
       */
    }
  }, []);

  const heights:
    Record<
      AdSlotSize,
      string
    > = {
      banner:
        "min-h-[90px] sm:min-h-[100px]",

      inline:
        "min-h-[120px] sm:min-h-[140px]",

      sidebar:
        "min-h-[250px]",
    };

  return (
    <div
      data-ad-slot-id={id}
      className={cn(
        "relative w-full max-w-full overflow-hidden rounded-2xl border border-dashed border-border bg-muted/40",
        heights[size],
        className,
      )}
    >
      {/* PLACEHOLDER */}

      {!adLoaded ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
          <span className="truncate text-xs font-medium text-muted-foreground">
            Espaço reservado para anúncio
          </span>
        </div>
      ) : null}

      {/* GOOGLE ADSENSE */}

      <ins
        className="adsbygoogle block h-full w-full"
        style={{
          display:
            "block",
        }}
        data-ad-client="ca-pub-8390455641519303"
        data-ad-slot="5029040323"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}