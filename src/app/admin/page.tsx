import type { Metadata } from "next";
import Link from "next/link";
import { count, desc, eq, gte, sql } from "drizzle-orm";
import { ArrowRight, Briefcase, Building2, FileText, Flag, GraduationCap, Mail } from "lucide-react";
import { db } from "@/db";
import { applications, companies, contactMessages, opportunities, reports, users } from "@/db/schema";
import { PageHeader, StatCard } from "@/components/dashboard/page-header";
import { ActionButton } from "@/components/admin/action-button";
import { CompanyLogo, UserAvatar } from "@/components/shared/company-logo";
import { moderateOpportunityAction } from "@/app/actions/admin";
import { daysAgo, formatDate, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin Overview" };

export default async function AdminOverview() {
  const since = daysAgo(13);
  const [
    [{ students }],
    [{ companyCount }],
    [{ live }],
    [{ appCount }],
    [{ openReports }],
    [{ newMessages }],
    pending,
    signups,
    daily,
  ] = await Promise.all([
    db.select({ students: count() }).from(users).where(eq(users.role, "student")),
    db.select({ companyCount: count() }).from(companies),
    db.select({ live: count() }).from(opportunities).where(eq(opportunities.status, "published")),
    db.select({ appCount: count() }).from(applications).where(sql`${applications.status} <> 'draft'`),
    db.select({ openReports: count() }).from(reports).where(eq(reports.status, "open")),
    db.select({ newMessages: count() }).from(contactMessages).where(eq(contactMessages.status, "new")),
    db.query.opportunities.findMany({
      where: eq(opportunities.status, "pending"),
      with: { company: true },
      orderBy: desc(opportunities.createdAt),
      limit: 6,
    }),
    db.select().from(users).orderBy(desc(users.createdAt)).limit(6),
    db
      .select({ day: sql<string>`to_char(date_trunc('day', ${applications.submittedAt}), 'YYYY-MM-DD')`, n: count() })
      .from(applications)
      .where(gte(applications.submittedAt, since))
      .groupBy(sql`1`),
  ]);
  const byDay = Object.fromEntries(daily.map((d) => [d.day, d.n]));
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since.getTime() + i * 86400000);
    const key = d.toISOString().slice(0, 10);
    return { key, label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), n: byDay[key] ?? 0 };
  });
  const max = Math.max(1, ...days.map((d) => d.n));

  return (
    <>
      <PageHeader title="Admin Overview" description="Everything happening on Internly at a glance." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard value={live} label="Live opportunities" icon={<Briefcase className="size-5" />} />
        <StatCard value={companyCount} label="Companies" icon={<Building2 className="size-5" />} tone="blue" />
        <StatCard value={students} label="Students" icon={<GraduationCap className="size-5" />} tone="purple" />
        <StatCard value={appCount} label="Applications" icon={<FileText className="size-5" />} tone="amber" />
        <Link href="/admin/reports">
          <StatCard value={openReports} label="Open reports" icon={<Flag className="size-5" />} tone="red" />
        </Link>
        <Link href="/admin/messages">
          <StatCard value={newMessages} label="New messages" icon={<Mail className="size-5" />} tone="blue" />
        </Link>
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-card">
        <h2 className="font-bold">Applications — last 14 days</h2>
        <div className="mt-6 flex h-44 items-end gap-2" role="img" aria-label="Applications per day over the last 14 days">
          {days.map((d) => (
            <div key={d.key} className="group flex flex-1 flex-col items-center gap-2">
              <span className="text-[11px] font-medium text-ink/60 opacity-0 transition group-hover:opacity-100">{d.n}</span>
              <div className="w-full rounded-t-md bg-brand-500 transition group-hover:bg-brand-700" style={{ height: `${Math.max(3, (d.n / max) * 120)}px` }} />
              <span className="hidden text-[10px] text-muted sm:block">{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-bold">Awaiting review ({pending.length})</h2>
            <Link href="/admin/opportunities?status=pending" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
              View all <ArrowRight className="size-4" />
            </Link>
          </div>
          {pending.length ? (
            <ul className="divide-y divide-line">
              {pending.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <CompanyLogo name={o.company.name} logoUrl={o.company.logoUrl} color={o.company.brandColor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <Link href={`/opportunities/${o.slug}`} className="block truncate text-sm font-semibold hover:text-brand-700">
                      {o.title}
                    </Link>
                    <p className="text-xs text-muted">
                      {o.company.name} · {timeAgo(o.createdAt)}
                    </p>
                  </div>
                  <ActionButton size="xs" action={moderateOpportunityAction.bind(null, o.id, "approve")} successMessage="Approved and published">
                    Approve
                  </ActionButton>
                  <ActionButton
                    size="xs"
                    variant="danger-outline"
                    prompt="Reason for rejection (shared with the company):"
                    action={moderateOpportunityAction.bind(null, o.id, "reject")}
                    successMessage="Rejected"
                  >
                    Reject
                  </ActionButton>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-muted">Nothing to review. 🎉</p>
          )}
        </section>
        <section className="rounded-2xl border border-line bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-bold">Newest users</h2>
            <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
              View all <ArrowRight className="size-4" />
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {signups.map((u) => (
              <li key={u.id} className="flex items-center gap-3 px-5 py-3">
                <UserAvatar name={u.name} src={u.avatarUrl} className="size-9 text-xs" />
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/users/${u.id}`} className="block truncate text-sm font-semibold hover:text-brand-700">
                    {u.name}
                  </Link>
                  <p className="truncate text-xs text-muted">{u.email}</p>
                </div>
                <span className="rounded-full bg-canvas px-2 py-0.5 text-[11px] capitalize text-ink/70">{u.role}</span>
                <span className="hidden text-xs text-muted sm:block">{formatDate(u.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
