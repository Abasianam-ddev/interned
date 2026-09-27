import { BriefcaseBusiness, FileText, MapPin, Search } from "lucide-react";
import { LOCATIONS, OPPORTUNITY_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const selectCls =
  "h-11 w-full cursor-pointer appearance-none rounded-lg border border-line bg-white pl-10 pr-9 text-sm text-ink focus:border-brand-500 focus:outline-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2310201b%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[position:right_12px_center] bg-no-repeat";

export function HeroSearch({ fields, className }: { fields: { slug: string; name: string }[]; className?: string }) {
  return (
    <form
      action="/opportunities"
      className={cn(
        "grid gap-2.5 rounded-2xl bg-white p-2.5 shadow-float ring-1 ring-line sm:grid-cols-2 lg:grid-cols-[minmax(0,2.4fr)_1fr_1fr_1fr_auto]",
        className,
      )}
      role="search"
    >
      <div className="relative sm:col-span-2 lg:col-span-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink/60" />
        <input
          name="q"
          placeholder="Search internships, skills, companies..."
          aria-label="Search internships, skills, companies"
          className="h-11 w-full rounded-lg border border-line bg-canvas/40 pl-11 pr-3 text-sm placeholder:text-muted focus:border-brand-500 focus:bg-white focus:outline-none"
        />
      </div>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink/70" />
        <select name="location" aria-label="Location" className={selectCls} defaultValue="">
          <option value="">Location</option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div className="relative">
        <BriefcaseBusiness className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink/70" />
        <select name="field" aria-label="Field" className={selectCls} defaultValue="">
          <option value="">Field</option>
          {fields.map((f) => (
            <option key={f.slug} value={f.slug}>
              {f.name}
            </option>
          ))}
        </select>
      </div>
      <div className="relative">
        <FileText className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink/70" />
        <select name="type" aria-label="Type" className={selectCls} defaultValue="">
          <option value="">Type</option>
          {OPPORTUNITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="h-11 rounded-lg bg-brand-700 px-8 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 sm:col-span-2 lg:col-span-1"
      >
        Search
      </button>
    </form>
  );
}
