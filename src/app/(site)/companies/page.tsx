import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, MapPin, Search } from "lucide-react";
import { CompanyLogo } from "@/components/shared/company-logo";
import { EmptyState } from "@/components/shared/empty-state";
import { getCompaniesWithCounts } from "@/lib/queries";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Companies Hiring Interns",
  description: "Work with leading companies and organizations, and kickstart your career.",
};

export default async function CompaniesPage({ searchParams }: PageProps<"/companies">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const industry = typeof sp.industry === "string" ? sp.industry : "";
  const [list, industries] = await Promise.all([
    getCompaniesWithCounts({ q: q || undefined, industry: industry || undefined }),
    db.selectDistinct({ industry: companies.industry }).from(companies).where(eq(companies.status, "active")),
  ]);
  return (
    <div className="bg-canvas/60">
      <div className="container-page py-10">
        <h1 className="text-[28px] font-bold">Top Companies Hiring Interns</h1>
        <p className="mt-1 text-sm text-muted">Work with leading companies and organizations, and kickstart your career.</p>

        <form className="mt-6 grid gap-2.5 rounded-2xl bg-white p-2.5 shadow-card ring-1 ring-line sm:grid-cols-[1fr_220px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink/60" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search companies..."
              className="h-11 w-full rounded-lg border border-line pl-11 pr-3 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <select
            name="industry"
            defaultValue={industry}
            className="h-11 rounded-lg border border-line bg-white px-3 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="">All industries</option>
            {industries
              .map((i) => i.industry)
              .filter(Boolean)
              .sort()
              .map((i) => (
                <option key={i} value={i!}>
                  {i}
                </option>
              ))}
          </select>
          <button className="h-11 rounded-lg bg-brand-700 px-8 text-sm font-semibold text-white hover:bg-brand-800">Search</button>
        </form>

        {list.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((c) => (
              <Link
                key={c.id}
                href={`/companies/${c.slug}`}
                className="group flex flex-col rounded-2xl border border-line bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:border-brand-200"
              >
                <CompanyLogo name={c.name} logoUrl={c.logoUrl} color={c.brandColor} size="lg" rounded="xl" />
                <h2 className="mt-5 flex items-center gap-1.5 text-base font-bold">
                  <span className="truncate">{c.name}</span>
                  {c.verified && <BadgeCheck className="size-4 shrink-0 fill-brand-600 text-white" />}
                </h2>
                <p className="text-[13px] text-muted">{c.industry ?? "Company"}</p>
                {c.location && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-ink/70">
                    <MapPin className="size-3.5" /> {c.location}
                  </p>
                )}
                <p className="mt-1 text-xs text-ink/70">
                  {c.openings} {c.openings === 1 ? "internship" : "internships"}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-brand-700">
                  View Profile <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon={Building2} title="No companies found" description="Try a different search." className="mt-8" />
        )}
      </div>
    </div>
  );
}
