import type { Metadata } from "next";
import Link from "next/link";
import { and, count, desc, eq, ne } from "drizzle-orm";
import { ArrowRight, Bookmark, FileText, Search, Sparkles } from "lucide-react";
import { db } from "@/db";
import { applications, notifications, savedOpportunities, studentProfiles } from "@/db/schema";
import { OpportunityCard } from "@/components/opportunity/cards";
import { PageHeader, StatCard } from "@/components/dashboard/page-header";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { CompanyLogo } from "@/components/shared/company-logo";
import { SafeImg } from "@/components/shared/safe-img";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { countNewOpportunities, getRecommendations, profileCompletion } from "@/lib/student";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Africa/Lagos" }).format(new Date()));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function StudentDashboard() {
  const user = await requireUser(["student"]);
  const profile = await db.query.studentProfiles.findFirst({ where: eq(studentProfiles.userId, user.id) });
  const [[{ saved }], [{ applied }], newCount, recommended, activity, drafts] = await Promise.all([
    db.select({ saved: count() }).from(savedOpportunities).where(eq(savedOpportunities.userId, user.id)),
    db
      .select({ applied: count() })
      .from(applications)
      .where(and(eq(applications.userId, user.id), ne(applications.status, "draft"))),
    countNewOpportunities(),
    getRecommendations(user.id, profile, 3),
    db.select().from(notifications).where(eq(notifications.userId, user.id)).orderBy(desc(notifications.createdAt)).limit(5),
    db.query.applications.findMany({
      where: and(eq(applications.userId, user.id), eq(applications.status, "draft")),
      with: { opportunity: { with: { company: true } } },
      limit: 3,
    }),
  ]);
  const completion = profileCompletion(user, profile);

  return (
    <>
      <PageHeader
        title={
          <>
            {greeting()}, {user.name.split(" ")[0]} <span aria-hidden>👋</span>
          </>
        }
        description="Here's what's happening with your internship journey."
      />

      <form action="/opportunities" className="relative mb-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          name="q"
          placeholder="Search internships, companies or skills..."
          className="h-12 w-full rounded-xl border border-line bg-white pl-12 pr-28 text-sm shadow-card focus:border-brand-500 focus:outline-none"
        />
        <button className="absolute right-1.5 top-1.5 flex h-9 items-center rounded-lg bg-brand-700 px-4 text-white hover:bg-brand-800" aria-label="Search">
          <Search className="size-4" />
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/dashboard/saved">
          <StatCard value={saved} label="Saved Internships" icon={<Bookmark className="size-5" />} />
        </Link>
        <Link href="/dashboard/applications">
          <StatCard value={applied} label="Applications" icon={<FileText className="size-5" />} tone="blue" />
        </Link>
        <Link href="/opportunities?sort=newest">
          <StatCard value={newCount} label="New Opportunities this week" icon={<Sparkles className="size-5" />} tone="amber" />
        </Link>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-2xl bg-brand-800 p-8 text-white">
        <SafeImg
          src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80"
          alt=""
          className="absolute inset-y-0 right-0 hidden h-full w-2/5 object-cover opacity-80 [mask-image:linear-gradient(to_right,transparent,black_40%)] md:block"
          fallback={<div className="absolute -right-10 -top-10 size-64 rounded-full bg-brand-700" />}
        />
        <div className="relative max-w-md">
          <h2 className="text-xl font-bold">Your future is built on the opportunities you take.</h2>
          <p className="mt-2 text-sm text-white/75">Keep exploring, keep applying.</p>
          <Button asChild className="mt-5 bg-white text-brand-900 hover:bg-brand-50">
            <Link href="/opportunities">Explore Internships</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-8">
          {drafts.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold">Continue your applications</h2>
              <div className="space-y-3">
                {drafts.map((d) => (
                  <div key={d.id} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-card">
                    <CompanyLogo name={d.opportunity.company.name} logoUrl={d.opportunity.company.logoUrl} color={d.opportunity.company.brandColor} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{d.opportunity.title}</p>
                      <p className="text-xs text-muted">
                        {d.opportunity.company.name} · Step {d.step} of 3
                      </p>
                    </div>
                    <Button asChild size="sm" variant="soft">
                      <Link href={`/opportunities/${d.opportunity.slug}/apply`}>
                        Continue <ArrowRight />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Recommended for you</h2>
              <Link href="/opportunities" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
                View all <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {recommended.map((o) => (
                <OpportunityCard key={o.id} o={o} />
              ))}
            </div>
          </section>
        </div>
        <aside className="space-y-6">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="flex items-center gap-4">
              <ProgressRing percent={completion.percent} />
              <div>
                <h3 className="font-bold">Complete your profile</h3>
                <p className="mt-1 text-xs text-muted">Complete your profile to get better opportunities and recommendations.</p>
              </div>
            </div>
            {completion.missing.length > 0 && (
              <ul className="mt-4 space-y-1.5 text-xs text-ink/70">
                {completion.missing.slice(0, 3).map((m) => (
                  <li key={m}>• {m}</li>
                ))}
              </ul>
            )}
            <Button asChild size="sm" className="mt-4 w-full">
              <Link href="/dashboard/profile">{completion.percent === 100 ? "View Profile" : "Complete Profile"}</Link>
            </Button>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <h3 className="mb-3 font-bold">Recent Activity</h3>
            {activity.length === 0 ? (
              <p className="text-sm text-muted">No activity yet.</p>
            ) : (
              <ul className="space-y-4">
                {activity.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                      <FileText className="size-4" />
                    </span>
                    <div>
                      <Link href={a.link ?? "/dashboard/notifications"} className="text-[13px] font-medium leading-snug hover:text-brand-700">
                        {a.title}
                      </Link>
                      <p className="text-[11px] text-muted">{timeAgo(a.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
