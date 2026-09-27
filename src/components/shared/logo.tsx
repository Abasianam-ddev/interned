import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <path d="M6 4h21l-5.5 7H6z" fill="currentColor" />
      <path d="M21.5 11 9 28l3.5-11H6z" fill="currentColor" opacity=".78" />
      <path d="M12.5 17H26l-6 7h-9.5z" fill="currentColor" opacity=".55" />
    </svg>
  );
}

export function Logo({ className, href = "/", light = false }: { className?: string; href?: string; light?: boolean }) {
  return (
    <Link href={href} className={cn("flex items-center gap-1.5", className)} aria-label="Internly home">
      <LogoMark className={cn("size-8", light ? "text-brand-300" : "text-brand-700")} />
      <span className={cn("font-display text-[26px] font-extrabold tracking-tight", light ? "text-white" : "text-brand-950")}>
        Internly
      </span>
    </Link>
  );
}
