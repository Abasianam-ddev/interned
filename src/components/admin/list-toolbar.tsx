import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/** Server-rendered search box + status tabs driven by query params. */
export function ListToolbar({
  basePath,
  params,
  tabs,
  tabKey = "status",
  placeholder = "Search…",
  extra,
}: {
  basePath: string;
  params: Record<string, string | string[] | undefined>;
  tabs?: { value: string; label: string; count?: number }[];
  tabKey?: string;
  placeholder?: string;
  extra?: React.ReactNode;
}) {
  const current = typeof params[tabKey] === "string" ? (params[tabKey] as string) : "";
  const q = typeof params.q === "string" ? params.q : "";
  const hrefFor = (value: string) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (typeof v === "string" && v && k !== tabKey && k !== "page" && k !== "saved") sp.set(k, v);
    if (value) sp.set(tabKey, value);
    const s = sp.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  return (
    <div className="mb-5 space-y-4">
      <form className="flex flex-col gap-2.5 sm:flex-row" action={basePath}>
        {current && <input type="hidden" name={tabKey} value={current} />}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={q}
            placeholder={placeholder}
            className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        {extra}
        <button className="h-10 rounded-lg bg-brand-700 px-5 text-sm font-semibold text-white hover:bg-brand-800">Search</button>
      </form>
      {tabs && (
        <div className="scrollbar-none flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <Link
              key={t.value}
              href={hrefFor(t.value)}
              className={cn(
                "whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium ring-1",
                current === t.value ? "bg-brand-700 text-white ring-brand-700" : "bg-white text-ink/75 ring-line hover:bg-brand-50",
              )}
            >
              {t.label}
              {t.count != null && <span className="ml-1.5 opacity-75">{t.count}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("px-5 py-3 text-left text-xs font-medium text-muted", className)}>{children}</th>;
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("px-5 py-3.5 align-middle", className)}>{children}</td>;
}

export function TableCard({ children, minWidth = 820 }: { children: React.ReactNode; minWidth?: number }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
      <table className="w-full text-sm" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}
