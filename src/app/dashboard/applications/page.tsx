import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, inArray, type SQL } from "drizzle-orm";
import { ChevronRight, FileText } from "lucide-react";
import { db } from "@/db";
import { applications, type ApplicationStatus } from "@/db/schema";
import { PageHeader } from "@/components/dashboard/page-header";
import { CompanyLogo } from "@/components/shared/company-logo";
import { EmptyState } from "@/components/shared/empty-state";
import { ApplicationStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "My Applications" };

const TABS: { key: string; label: string; statuses?: ApplicationStatus[] }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending", statuses: ["submitted", "under_review"] },
  { key: "shortlisted", label: "Shortlisted", statuses: ["shortlisted"] },
  { key: "interview", label: "Interview", statuses: ["interview"] },
  { key: "accepted", label: "Accepted", statuses: ["accepted"] },
  { key: "rejected", label: "Rejected", statuses: ["rejected", "withdrawn"] },
  { key: "drafts", label: "Drafts", statuses: ["draft"] },
];

export default async function ApplicationsPage({ searchParams }: PageProps<"/dashboard/applications">) {
  const user = await requireUser(["student"]);
  const { tab = "all" } = await searchParams;
  const active = TABS.find((t) => t.key === tab) ?? TABS[0];
  const conds: SQL[] = [eq(applications.userId, user.id)];
  if (active.statuses) conds.push(inArray(applications.status, active.statuses));
  const all = await db.query.applications.findMany({
    where: eq(applications.userId, user.id),
    columns: { status: true },
  });
  const list = await db.query.applications.findMany({
    where: and(...conds),
    with: { opportunity: { with: { company: true } } },
    orderBy: desc(applications.updatedAt),
  });
  const countFor = (t: (typeof TABS)[number]) => (t.statuses ? all.filter((a) => t.statuses!.includes(a.status)).length : all.length);

  return (
    <>
      <PageHeader title="My Applications" description="Track your internship applications." />
      <div className="scrollbar-none mb-6 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/dashboard/applications" : `/dashboard/applications?tab=${t.key}`}
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium ring-1 transition",
              active.key === t.key ? "bg-brand-700 text-white ring-brand-700" : "bg-white text-ink/75 ring-line hover:bg-brand-50",
            )}
          >
            {t.label}
            <span className={cn("rounded-full px-1.5 text-[11px]", active.key === t.key ? "bg-white/20" : "bg-canvas")}>{countFor(t)}</span>
          </Link>
        ))}
      </div>
      {list.length ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <ul className="divide-y divide-line">
            {list.map((a) => (
              <li key={a.id}>
                <Link
                  href={a.status === "draft" ? `/opportunities/${a.opportunity.slug}/apply` : `/dashboard/applications/${a.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition hover:bg-canvas/70"
                >
                  <CompanyLogo name={a.opportunity.company.name} logoUrl={a.opportunity.company.logoUrl} color={a.opportunity.company.brandColor} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{a.opportunity.title}</p>
                    <p className="truncate text-[13px] text-muted">{a.opportunity.company.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {a.status === "draft" ? `Draft · step ${a.step} of 3 · last edited ${formatDate(a.updatedAt)}` : `Applied: ${formatDate(a.submittedAt)}`}
                    </p>
                  </div>
                  <ApplicationStatusBadge status={a.status} />
                  <ChevronRight className="hidden size-4 text-muted sm:block" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No applications here"
          description="When you apply for opportunities, you can track their progress here."
          action={
            <Button asChild>
              <Link href="/opportunities">Find opportunities</Link>
            </Button>
          }
        />
      )}
    </>
  );
}
