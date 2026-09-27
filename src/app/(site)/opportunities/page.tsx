import type { Metadata } from "next";
import { Search, SearchX } from "lucide-react";
import { OpportunityRow } from "@/components/opportunity/cards";
import { ActiveFilters, FilterPanel, MobileFilters, SortSelect, type FilterGroup } from "@/components/opportunity/filters";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { getCurrentUser } from "@/lib/auth";
import { DURATIONS, LOCATIONS, OPPORTUNITY_TYPES, WORK_MODES } from "@/lib/constants";
import { getAllFields, getAppliedIds, getFacetCounts, getSavedIds, parseFilters, searchOpportunities } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Internship Opportunities",
  description: "Discover verified internships, SIWES and entry-level opportunities.",
};

export default async function OpportunitiesPage({ searchParams }: PageProps<"/opportunities">) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const [user, result, facets, allFields] = await Promise.all([
    getCurrentUser(),
    searchOpportunities(filters),
    getFacetCounts(),
    getAllFields(),
  ]);
  const isStudent = user?.role === "student";
  const [saved, applied] = await Promise.all([
    getSavedIds(isStudent ? user.id : undefined),
    getAppliedIds(isStudent ? user.id : undefined),
  ]);

  const groups: FilterGroup[] = [
    {
      key: "location",
      title: "Location",
      options: LOCATIONS.map((l) => ({ value: l, label: l, count: facets.location[l.toLowerCase()] ?? 0 })),
    },
    {
      key: "field",
      title: "Field",
      options: allFields.map((f) => ({ value: f.slug, label: f.name, count: facets.field[f.slug] ?? 0 })),
    },
    {
      key: "type",
      title: "Type",
      options: OPPORTUNITY_TYPES.map((t) => ({ value: t.value, label: t.label, count: facets.type[t.value] ?? 0 })),
      initiallyShown: 6,
    },
    {
      key: "mode",
      title: "Work mode",
      options: WORK_MODES.map((m) => ({ value: m.value, label: m.label, count: facets.mode[m.value] ?? 0 })),
    },
    {
      key: "duration",
      title: "Duration",
      options: DURATIONS.map((d) => ({ ...d, count: facets.duration[d.value] ?? 0 })),
    },
    {
      key: "pay",
      title: "Stipend",
      options: [
        { value: "paid", label: "Paid" },
        { value: "unpaid", label: "Unpaid" },
      ],
    },
  ];

  const labelFor = (key: string, value: string) =>
    groups.find((g) => g.key === key)?.options.find((o) => o.value === value)?.label ?? value;
  const chips = [
    ...(filters.q ? [{ key: "q", value: filters.q, label: `“${filters.q}”` }] : []),
    ...(["location", "field", "type", "mode", "duration", "pay"] as const).flatMap((k) =>
      (filters[k] ?? []).map((v) => ({ key: k, value: v, label: labelFor(k, v) })),
    ),
  ];
  const isSearch = chips.length > 0;

  return (
    <div className="bg-canvas/60">
      <div className="container-page py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[28px] font-bold text-ink">{isSearch ? "Search Results" : "Internship Opportunities"}</h1>
            <p className="mt-1 text-sm text-muted">
              {filters.q
                ? `Showing ${result.total} results for “${filters.q}”`
                : "Discover verified internships, SIWES and entry-level opportunities."}
            </p>
          </div>
          <p className="text-sm font-medium text-brand-800">{result.total.toLocaleString()} opportunities</p>
        </div>

        <form action="/opportunities" className="mt-6 flex gap-2.5 rounded-2xl bg-white p-2.5 shadow-card ring-1 ring-line" role="search">
          {Object.entries(sp).flatMap(([k, v]) =>
            k === "q" || k === "page" || v == null
              ? []
              : (Array.isArray(v) ? v : [v]).map((val, i) => <input key={`${k}${i}`} type="hidden" name={k} value={val} />),
          )}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink/60" />
            <input
              name="q"
              defaultValue={filters.q}
              placeholder="Search internships, companies, skills..."
              aria-label="Search"
              className="h-11 w-full rounded-lg border border-line pl-11 pr-3 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <button className="h-11 rounded-lg bg-brand-700 px-8 text-sm font-semibold text-white hover:bg-brand-800">Search</button>
        </form>

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-line bg-white p-6 shadow-card">
              <FilterPanel groups={groups} />
            </div>
          </aside>
          <section aria-label="Results">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <MobileFilters groups={groups} activeCount={chips.length} />
                <p className="text-sm text-muted">
                  <span className="font-semibold text-ink">{result.total}</span> opportunities found
                </p>
              </div>
              <SortSelect />
            </div>
            <div className="mb-4">
              <ActiveFilters chips={chips} />
            </div>
            {result.items.length ? (
              <div className="space-y-4">
                {result.items.map((o) => (
                  <OpportunityRow
                    key={o.id}
                    o={o}
                    saved={saved.has(o.id)}
                    applied={applied.has(o.id)}
                    loggedIn={user && !isStudent ? undefined : isStudent}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={SearchX}
                title="No opportunities match your filters"
                description="Try removing some filters or searching with different keywords."
              />
            )}
            <Pagination page={result.page} totalPages={result.totalPages} basePath="/opportunities" params={sp} />
          </section>
        </div>
      </div>
    </div>
  );
}
