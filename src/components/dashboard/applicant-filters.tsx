"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { APPLICATION_STATUS } from "@/lib/constants";

export function ApplicantFilters({ opportunities }: { opportunities: { id: string; title: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const set = (k: string, v: string) => {
    const sp = new URLSearchParams(params.toString());
    if (v) sp.set(k, v);
    else sp.delete(k);
    sp.delete("page");
    router.push(`${pathname}?${sp}`);
  };
  const cls = "h-10 rounded-lg border border-line bg-white px-3 text-sm focus:border-brand-500 focus:outline-none";
  return (
    <div className="mb-5 flex flex-col gap-2.5 sm:flex-row">
      <form
        className="relative flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          set("q", String(new FormData(e.currentTarget).get("q") ?? ""));
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input name="q" defaultValue={params.get("q") ?? ""} placeholder="Search by name, email or school" className={`${cls} w-full pl-9`} />
      </form>
      {opportunities.length > 0 && (
        <select className={cls} value={params.get("opportunity") ?? ""} onChange={(e) => set("opportunity", e.target.value)} aria-label="Opportunity">
          <option value="">All opportunities</option>
          {opportunities.map((o) => (
            <option key={o.id} value={o.id}>
              {o.title}
            </option>
          ))}
        </select>
      )}
      <select className={cls} value={params.get("status") ?? ""} onChange={(e) => set("status", e.target.value)} aria-label="Status">
        <option value="">All statuses</option>
        {Object.entries(APPLICATION_STATUS)
          .filter(([k]) => k !== "draft")
          .map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
      </select>
    </div>
  );
}
