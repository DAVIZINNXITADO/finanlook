import {
  useEffect,
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
  useEffect(() => {
    try {
      (
        window.adsbygoogle =
          window.adsbygoogle ||
          []
      ).push({});
    } catch {
      // Evita que um erro do anúncio
      // quebre o restante da página.
    }
  }, []);

  const heights:
    Record<
      AdSlotSize,
      string
    > = {
      banner:
        "min-h-[90px]",

      inline:
        "min-h-[120px]",

      sidebar:
        "min-h-[250px]",
    };

  return (
    <div
      data-ad-slot-id={id}
      className={cn(
        "w-full max-w-full overflow-hidden",
        heights[size],
        className,
      )}
    >
      <ins
        className="adsbygoogle block"
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