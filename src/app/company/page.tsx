import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Briefcase, Eye, FileText, ShieldAlert, Sparkles, UserCheck, Users } from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/page-header";
import { UserAvatar } from "@/components/shared/company-logo";
import { EmptyState } from "@/components/shared/empty-state";
import { ApplicationStatusBadge, OpportunityStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { requireCompany } from "@/lib/auth";
import { getApplicants, getCompanyOpportunities, getCompanyStats } from "@/lib/company";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Company Dashboard" };

export default async function CompanyDashboard() {
  const { user, company } = await requireCompany();
  const [stats, recent, opps] = await Promise.all([
    getCompanyStats(company.id),
    getApplicants(company.id, { limit: 6 }),
    getCompanyOpportunities(company.id),
  ]);
  const profileIncomplete = !company.description || !company.logoUrl || !company.location;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]} 👋`}
        description={`Here's what's happening at ${company.name}.`}
        actions={
          <Button asChild>
            <Link href="/company/opportunities/new">Post Opportunity</Link>
          </Button>
        }
      />
      {!company.verified && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center">
          <ShieldAlert className="size-6 shrink-0 text-amber-600" />
          <div className="flex-1 text-sm text-amber-900">
            <strong>Your company isn&apos;t verified yet.</strong> New opportunities are reviewed by our team before going live. Complete your
            company profile to speed up verification.
          </div>
          <Button asChild size="sm" variant="secondary">
            <Link href="/company/profile">Complete profile</Link>
          </Button>
        </div>
      )}
      {company.verified && profileIncomplete && (
        <div className="mb-6 rounded-2xl border border-line bg-white p-5 text-sm shadow-card">
          Add a logo, location and description to make your company page stand out.{" "}
          <Link href="/company/profile" className="font-semibold text-brand-700 hover:underline">
            Update profile →
          </Link>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={stats.active} label="Active opportunities" icon={<Briefcase className="size-5" />} />
        <StatCard value={stats.total} label="Total applications" icon={<FileText className="size-5" />} tone="blue" />
        <StatCard value={stats.shortlisted} label="Shortlisted" icon={<UserCheck className="size-5" />} tone="purple" />
        <StatCard value={stats.interview} label="Interviews" icon={<Users className="size-5" />} tone="amber" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-2xl border border-line bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-bold">Recent Applications</h2>
            <Link href="/company/applicants" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
              View all <ArrowRight className="size-4" />
            </Link>
          </div>
          {recent.rows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Applicant</th>
                    <th className="px-5 py-3 font-medium">Position</th>
                    <th className="px-5 py-3 font-medium">Applied</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {recent.rows.map((a) => (
                    <tr key={a.id} className="hover:bg-canvas/60">
                      <td className="px-5 py-3">
                        <Link href={`/company/applicants/${a.id}`} className="flex items-center gap-3">
                          <UserAvatar name={a.fullName} src={a.avatarUrl} className="size-8 text-xs" />
                          <span>
                            <span className="block font-medium">{a.fullName}</span>
                            <span className="block text-xs text-muted">{a.school ?? a.email}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-ink/80">{a.opportunityTitle}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-ink/70">{formatDate(a.submittedAt)}</td>
                      <td className="px-5 py-3">
                        <ApplicationStatusBadge status={a.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5">
              <EmptyState icon={FileText} title="No applications yet" description="Applications will appear here as students apply." />
            </div>
          )}
        </section>
        <aside className="space-y-6">
          <section className="rounded-2xl border border-line bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-bold">Your Opportunities</h2>
              <Link href="/company/opportunities" className="text-sm font-medium text-brand-700 hover:underline">
                Manage
              </Link>
            </div>
            {opps.length ? (
              <ul className="divide-y divide-line">
                {opps.slice(0, 5).map((o) => (
                  <li key={o.id} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/company/applicants?opportunity=${o.id}`} className="min-w-0">
                        <p className="truncate text-sm font-semibold hover:text-brand-700">{o.title}</p>
                        <p className="text-xs text-muted">
                          {o.applicants} applicants · {o.views} views
                        </p>
                      </Link>
                      <OpportunityStatusBadge status={o.status} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-5 text-center text-sm text-muted">
                <Sparkles className="mx-auto mb-2 size-6 text-brand-600" />
                Post your first opportunity to start receiving applications.
              </div>
            )}
          </section>
          <div className="flex items-center gap-4 rounded-2xl bg-brand-900 p-5 text-white">
            <Eye className="size-8 text-brand-300" />
            <div>
              <p className="font-display text-2xl font-bold">{stats.views.toLocaleString()}</p>
              <p className="text-xs text-white/70">Total views on your opportunities</p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
