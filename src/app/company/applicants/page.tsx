import type { Metadata } from "next";
import { Users } from "lucide-react";
import { ApplicantFilters } from "@/components/dashboard/applicant-filters";
import { ApplicantTable } from "@/components/dashboard/applicant-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { requireCompany } from "@/lib/auth";
import { getApplicants, getCompanyOpportunities } from "@/lib/company";

export const metadata: Metadata = { title: "Applicants" };

const PER_PAGE = 25;

export default async function CompanyApplicantsPage({ searchParams }: PageProps<"/company/applicants">) {
  const { company } = await requireCompany();
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (typeof v === "string" && v ? v : undefined);
  const page = Math.max(1, Number(one(sp.page) ?? 1) || 1);
  const [opps, { rows, total }] = await Promise.all([
    getCompanyOpportunities(company.id),
    getApplicants(company.id, {
      opportunityId: one(sp.opportunity),
      status: one(sp.status),
      q: one(sp.q),
      limit: PER_PAGE,
      offset: (page - 1) * PER_PAGE,
    }),
  ]);
  const selected = opps.find((o) => o.id === one(sp.opportunity));
  return (
    <>
      <PageHeader title={selected ? `Applicants · ${selected.title}` : "Applicants"} description={`${total} ${total === 1 ? "applicant" : "applicants"}`} />
      <ApplicantFilters opportunities={opps.map((o) => ({ id: o.id, title: o.title }))} />
      {rows.length ? (
        <ApplicantTable rows={rows} hrefBase="/company/applicants" showOpportunity={!selected} />
      ) : (
        <EmptyState icon={Users} title="No applicants found" description="Try changing your filters." />
      )}
      <Pagination page={page} totalPages={Math.ceil(total / PER_PAGE)} basePath="/company/applicants" params={sp} />
    </>
  );
}
