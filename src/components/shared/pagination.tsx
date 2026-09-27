import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params: Record<string, string | string[] | undefined>;
}) {
  if (totalPages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (k === "page" || v == null) continue;
      for (const item of Array.isArray(v) ? v : [v]) if (item !== "") sp.append(k, item);
    }
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  const base = "flex size-9 items-center justify-center rounded-lg text-sm font-medium transition";
  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} className={cn(base, "border border-line hover:bg-brand-50")} aria-label="Previous page">
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={cn(base, "border border-line opacity-40")}>
          <ChevronLeft className="size-4" />
        </span>
      )}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-muted">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(base, p === page ? "bg-brand-700 text-white" : "border border-line hover:bg-brand-50")}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={href(page + 1)} className={cn(base, "border border-line hover:bg-brand-50")} aria-label="Next page">
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={cn(base, "border border-line opacity-40")}>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
