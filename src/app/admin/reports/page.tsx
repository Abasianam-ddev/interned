import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Flag } from "lucide-react";
import { db } from "@/db";
import { reports, type Report } from "@/db/schema";
import { moderateOpportunityAction } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { ReportForm } from "@/components/admin/report-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Reports" };

const TONE = { open: "red", reviewing: "amber", resolved: "green", dismissed: "gray" } as const;

export default async function AdminReportsPage({ searchParams }: PageProps<"/admin/reports">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" && sp.status in TONE ? (sp.status as Report["status"]) : undefined;
  const list = await db.query.reports.findMany({
    where: status ? eq(reports.status, status) : undefined,
    with: { opportunity: { with: { company: true } }, reporter: { columns: { name: true, email: true } } },
    orderBy: desc(reports.createdAt),
    limit: 100,
  });
  return (
    <>
      <PageHeader title="Reports" description="Opportunities flagged by the community." />
      <ListToolbar
        basePath="/admin/reports"
        params={sp}
        tabs={[
          { value: "", label: "All" },
          { value: "open", label: "Open" },
          { value: "reviewing", label: "Reviewing" },
          { value: "resolved", label: "Resolved" },
          { value: "dismissed", label: "Dismissed" },
        ]}
      />
      {list.length ? (
        <div className="space-y-4">
          {list.map((r) => (
            <article key={r.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={TONE[r.status]} size="md" className="capitalize">
                      {r.status}
                    </Badge>
                    <span className="font-semibold">{r.reason}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {formatDateTime(r.createdAt)} · by {r.reporter?.name ?? r.email ?? "anonymous"}
                  </p>
                </div>
                {r.opportunity && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/opportunities/${r.opportunity.slug}`} className="text-sm font-medium text-brand-700 hover:underline">
                      {r.opportunity.title} · {r.opportunity.company.name}
                    </Link>
                    {r.opportunity.status === "published" && (
                      <ActionButton
                        size="xs"
                        variant="danger-outline"
                        confirm="Unpublish (close) this opportunity?"
                        action={moderateOpportunityAction.bind(null, r.opportunity.id, "close")}
                        successMessage="Opportunity closed"
                      >
                        Unpublish
                      </ActionButton>
                    )}
                    <Link href={`/admin/companies/${r.opportunity.companyId}`} className="text-xs text-muted hover:underline">
                      Manage company
                    </Link>
                  </div>
                )}
              </div>
              {r.details && <p className="mt-3 whitespace-pre-line rounded-xl bg-canvas p-3 text-sm text-ink/80">{r.details}</p>}
              <div className="mt-4 border-t border-line pt-4">
                <ReportForm id={r.id} status={r.status} adminNote={r.adminNote} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={Flag} title="No reports" description="Nothing has been reported." />
      )}
    </>
  );
}
