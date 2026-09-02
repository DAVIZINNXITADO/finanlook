import type { ComponentProps } from "react";

export const SITE_ICON_SRC = "/Favicon.png";

export function SiteIcon({
  alt = "FinanLook",
  ...props
}: Omit<ComponentProps<"img">, "src">) {
  return (
    <img
      {...props}
      src={SITE_ICON_SRC}
      alt={alt}
      decoding="async"
    />
  );
}