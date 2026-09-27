"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Plain <img> that swaps to a branded fallback when the source fails to load (including before hydration). */
export function SafeImg({
  src,
  alt,
  className,
  fallback,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { fallback?: React.ReactNode }) {
  const [failed, setFailed] = React.useState(!src);
  const ref = React.useRef<HTMLImageElement>(null);
  React.useEffect(() => {
    const img = ref.current;
    // The error event may fire before React hydrates; detect that case on mount.
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);
  if (failed) {
    return (
      fallback ?? (
        <div
          role="img"
          aria-label={alt}
          className={cn("bg-gradient-to-br from-brand-100 via-brand-200 to-brand-400/60", className)}
        />
      )
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} src={src} alt={alt} className={className} onError={() => setFailed(true)} {...props} />;
}
