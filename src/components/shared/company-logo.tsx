import { cn } from "@/lib/utils";

const sizes = {
  xs: "size-7 text-xs",
  sm: "size-9 text-base",
  md: "size-10 text-lg",
  lg: "size-14 text-2xl",
  xl: "size-20 text-4xl rounded-2xl",
} as const;

export function CompanyLogo({
  name,
  logoUrl,
  color,
  size = "md",
  className,
  rounded = "full",
}: {
  name: string;
  logoUrl?: string | null;
  color?: string | null;
  size?: keyof typeof sizes;
  className?: string;
  rounded?: "full" | "xl";
}) {
  const shape = rounded === "full" ? "rounded-full" : "rounded-xl";
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className={cn("shrink-0 border border-line bg-white object-contain", shape, sizes[size], className)}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={cn("flex shrink-0 items-center justify-center font-display font-bold text-white", shape, sizes[size], className)}
      style={{ backgroundColor: color ?? "#111827" }}
    >
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

export function UserAvatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join("");
  if (src)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={cn("size-10 shrink-0 rounded-full object-cover", className)} />;
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-900 text-sm font-semibold text-white",
        className,
      )}
    >
      {initials}
    </div>
  );
}
