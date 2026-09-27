import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, PlusCircle } from "lucide-react";
import { OpportunityActions } from "@/components/dashboard/opportunity-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FlashToast } from "@/components/shared/flash-toast";
import { OpportunityStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { requireCompany } from "@/lib/auth";
import { getCompanyOpportunities } from "@/lib/company";
import { OPPORTUNITY_STATUS, WORK_MODE_LABEL } from "@/lib/constants";
import { cn, formatDate, isDeadlinePassed } from "@/lib/utils";

export const metadata: Metadata = { title: "My Opportunities" };

export default async function CompanyOpportunitiesPage({ searchParams }: PageProps<"/company/opportunities">) {
  const { company } = await requireCompany();
  const { status } = await searchParams;
  const s = typeof status === "string" && status in OPPORTUNITY_STATUS ? status : undefined;
  const [list, all] = await Promise.all([getCompanyOpportunities(company.id, s), getCompanyOpportunities(company.id)]);
  const tabs = [{ key: "", label: "All" }, ...Object.entries(OPPORTUNITY_STATUS).map(([key, v]) => ({ key, label: v.label }))];
  return (
    <>
      <FlashToast />
      <PageHeader
        title="My Opportunities"
        description="Create, edit and manage your listings."
        actions={
          <Button asChild>
            <Link href="/company/opportunities/new">
              <PlusCircle /> Post Opportunity
            </Link>
          </Button>
        }
      />
      <div className="scrollbar-none mb-5 flex gap-2 overflow-x-auto">
        {tabs.map((t) => {
          const n = t.key ? all.filter((o) => o.status === t.key).length : all.length;
          return (
            <Link
              key={t.key}
              href={t.key ? `/company/opportunities?status=${t.key}` : "/company/opportunities"}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium ring-1",
                (s ?? "") === t.key ? "bg-brand-700 text-white ring-brand-700" : "bg-white text-ink/75 ring-line hover:bg-brand-50",
              )}
            >
              {t.label} ({n})
            </Link>
          );
        })}
      </div>
      {list.length ? (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line text-left text-xs text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Opportunity</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Applicants</th>
                <th className="px-5 py-3 font-medium">Views</th>
                <th className="px-5 py-3 font-medium">Deadline</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((o) => (
                <tr key={o.id} className="hover:bg-canvas/60">
                  <td className="px-5 py-4">
                    <Link href={`/company/opportunities/${o.id}/edit`} className="font-semibold hover:text-brand-700">
                      {o.title}
                    </Link>
                    <p className="text-xs text-muted">
                      {o.location} · {WORK_MODE_LABEL[o.workMode]} · Posted {formatDate(o.createdAt)}
                    </p>
                    {o.status === "rejected" && o.rejectionReason && <p className="mt-1 text-xs text-red-600">Reason: {o.rejectionReason}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <OpportunityStatusBadge status={o.status} />
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/company/applicants?opportunity=${o.id}`} className="font-medium hover:text-brand-700">
                      {o.applicants}
                    </Link>
                    {o.newApplicants > 0 && <span className="ml-2 rounded-full bg-brand-100 px-1.5 py-0.5 text-[11px] font-medium text-brand-800">{o.newApplicants} new</span>}
                  </td>
                  <td className="px-5 py-4 text-ink/75">{o.views}</td>
                  <td className={cn("whitespace-nowrap px-5 py-4", isDeadlinePassed(o.deadline) ? "text-red-600" : "text-ink/75")}>
                    {formatDate(o.deadline)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <OpportunityActions id={o.id} slug={o.slug} status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No opportunities here"
          description="Post an internship to start receiving applications from students."
          action={
            <Button asChild>
              <Link href="/company/opportunities/new">Post Opportunity</Link>
            </Button>
          }
        />
      )}
    </>
  );
}
