import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { opportunities } from "@/db/schema";
import { ApplicantFilters } from "@/components/dashboard/applicant-filters";
import { ApplicantTable } from "@/components/dashboard/applicant-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { getApplicants } from "@/lib/company";

export const metadata: Metadata = { title: "All Applications" };
const PER_PAGE = 25;

export default async function AdminApplicationsPage({ searchParams }: PageProps<"/admin/applications">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (typeof v === "string" && v ? v : undefined);
  const page = Math.max(1, Number(one(sp.page) ?? 1) || 1);
  const [opps, { rows, total }] = await Promise.all([
    db.select({ id: opportunities.id, title: opportunities.title }).from(opportunities).orderBy(desc(opportunities.createdAt)).limit(200),
    getApplicants(null, { opportunityId: one(sp.opportunity), status: one(sp.status), q: one(sp.q), limit: PER_PAGE, offset: (page - 1) * PER_PAGE }),
  ]);
  return (
    <>
      <PageHeader title="Applications" description={`${total} submitted applications across all companies.`} />
      <ApplicantFilters opportunities={opps} />
      {rows.length ? <ApplicantTable rows={rows} hrefBase="/admin/applications" /> : <EmptyState icon={FileText} title="No applications found" />}
      <Pagination page={page} totalPages={Math.ceil(total / PER_PAGE)} basePath="/admin/applications" params={sp} />
    </>
  );
}
