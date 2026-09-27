import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarClock,
  CalendarDays,
  Check,
  Flag,
  Globe,
  MapPin,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";
import { db } from "@/db";
import { applications, opportunities } from "@/db/schema";
import { ApplyButton, type ApplyState } from "@/components/opportunity/apply-button";
import { OpportunityMeta } from "@/components/opportunity/meta";
import { SaveButton } from "@/components/opportunity/save-button";
import { ShareButtons } from "@/components/opportunity/share";
import { CompanyLogo } from "@/components/shared/company-logo";
import { Tag, VerifiedBadge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCompanyForUser, getCurrentUser } from "@/lib/auth";
import { ELIGIBILITY_LABEL, OPPORTUNITY_STATUS, TYPE_LABEL, WORK_MODE_LABEL } from "@/lib/constants";
import { appUrl } from "@/lib/mail";
import { getOpportunityBySlug, getSavedIds, getSimilarOpportunities } from "@/lib/queries";
import { formatDate, formatDuration, formatStipend, isDeadlinePassed } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/opportunities/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const opp = await getOpportunityBySlug(slug);
  if (!opp) return { title: "Opportunity not found" };
  return {
    title: `${opp.title} at ${opp.company.name}`,
    description: opp.summary ?? opp.description.slice(0, 160),
  };
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-[14px] text-ink/80">
          <Check className="mt-0.5 size-4 shrink-0 text-brand-600" strokeWidth={3} />
          {item}
        </li>
      ))}
    </ul>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-base font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

export default async function OpportunityPage({ params }: PageProps<"/opportunities/[slug]">) {
  const { slug } = await params;
  const [opp, user] = await Promise.all([getOpportunityBySlug(slug), getCurrentUser()]);
  if (!opp) notFound();

  const ownerCompany = user?.role === "company" ? await getCompanyForUser(user.id) : null;
  const isOwner = ownerCompany?.id === opp.companyId;
  const canPreview = user?.role === "admin" || isOwner;
  if (opp.status !== "published" && !canPreview) notFound();
  if (opp.company.status === "suspended" && !canPreview) notFound();

  if (opp.status === "published" && !canPreview) {
    await db
      .update(opportunities)
      .set({ views: sql`${opportunities.views} + 1` })
      .where(eq(opportunities.id, opp.id));
  }

  const isStudent = user?.role === "student";
  const [similar, saved, existing] = await Promise.all([
    getSimilarOpportunities(opp),
    getSavedIds(isStudent ? user.id : undefined),
    isStudent
      ? db.query.applications.findFirst({ where: and(eq(applications.opportunityId, opp.id), eq(applications.userId, user.id)) })
      : undefined,
  ]);

  const closed = opp.status !== "published" || isDeadlinePassed(opp.deadline);
  const applyState: ApplyState = existing && existing.status !== "draft"
    ? { kind: "applied", applicationId: existing.id }
    : closed
      ? { kind: "closed" }
      : !user
        ? { kind: "guest" }
        : !isStudent
          ? { kind: "not-student" }
          : existing
            ? { kind: "draft" }
            : { kind: "open" };

  const c = opp.company;
  const url = appUrl(`/opportunities/${opp.slug}`);

  return (
    <div className="bg-white">
      {opp.status !== "published" && (
        <div className="bg-amber-50 py-2.5 text-center text-sm text-amber-800">
          Preview — this opportunity is <strong>{OPPORTUNITY_STATUS[opp.status].label}</strong> and not visible to the public.
        </div>
      )}
      <div className="container-page py-8">
        <Link href="/opportunities" className="inline-flex items-center gap-1.5 text-[13px] text-ink/70 hover:text-brand-700">
          <ArrowLeft className="size-4" /> Back to opportunities
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            {/* Header */}
            <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <VerifiedBadge verified={opp.verified} />
                <h1 className="mt-4 text-3xl font-bold text-ink sm:text-[34px]">{opp.title}</h1>
                <Link href={`/companies/${c.slug}`} className="mt-2 inline-block text-lg text-ink/80 hover:text-brand-700">
                  {c.name}
                </Link>
                <OpportunityMeta
                  size="md"
                  className="mt-6"
                  location={opp.workMode === "remote" ? "Remote" : opp.location}
                  stipend={opp.stipend}
                  paid={opp.paid}
                  durationMonths={opp.durationMonths}
                />
                <div className="mt-5 flex flex-wrap gap-2">
                  {opp.field && <Tag className="px-3 text-xs">{opp.field.name}</Tag>}
                  <Tag className="px-3 text-xs">{WORK_MODE_LABEL[opp.workMode]}</Tag>
                  <Tag className="px-3 text-xs">{ELIGIBILITY_LABEL[opp.eligibility]}</Tag>
                  <Tag className="px-3 text-xs">{TYPE_LABEL[opp.type]}</Tag>
                </div>
                <p className="mt-5 flex items-center gap-2 text-sm text-ink/80">
                  <CalendarDays className="size-[18px]" /> Application closes:{" "}
                  <span className="font-medium text-brand-700">{opp.deadline ? formatDate(opp.deadline) : "Rolling"}</span>
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-start sm:items-center">
                <CompanyLogo name={c.name} logoUrl={c.logoUrl} color={c.brandColor} size="xl" rounded="xl" />
                <p className="mt-3 text-sm font-bold uppercase tracking-[0.12em]">{c.name}</p>
                {c.tagline && <p className="mt-1 text-xs text-muted">{c.tagline}</p>}
              </div>
            </div>

            {/* Apply bar (mobile / tablet) */}
            <div className="mt-8 flex gap-3 lg:hidden">
              <ApplyButton
                state={applyState}
                slug={opp.slug}
                opportunityId={opp.id}
                method={opp.applicationMethod}
                externalUrl={opp.externalUrl}
                applicationEmail={opp.applicationEmail}
                title={opp.title}
                className="flex-1"
              />
              {(!user || isStudent) && (
                <SaveButton opportunityId={opp.id} saved={saved.has(opp.id)} loggedIn={!!user} className="size-12" />
              )}
            </div>

            <Tabs defaultValue="about" className="mt-10">
              <TabsList>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="learn">What You&apos;ll Learn</TabsTrigger>
                <TabsTrigger value="company">About the Company</TabsTrigger>
              </TabsList>
              <TabsContent value="about">
                <Section title="About the Opportunity">
                  <div className="space-y-3 text-[14.5px] leading-7 text-ink/80">
                    {opp.description.split(/\n\n+/).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </Section>
                {opp.responsibilities.length > 0 && (
                  <Section title="Responsibilities">
                    <List items={opp.responsibilities} />
                  </Section>
                )}
                {opp.requirements.length > 0 && (
                  <Section title="Requirements">
                    <List items={opp.requirements} />
                  </Section>
                )}
                {opp.learnings.length > 0 && (
                  <Section title="What You'll Learn">
                    <List items={opp.learnings} />
                  </Section>
                )}
                {opp.benefits.length > 0 && (
                  <Section title="Benefits">
                    <List items={opp.benefits} />
                  </Section>
                )}
                {opp.skills.length > 0 && (
                  <Section title="Skills">
                    <div className="flex flex-wrap gap-2">
                      {opp.skills.map((s) => (
                        <span key={s} className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-ink/80">
                          {s}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}
              </TabsContent>
              <TabsContent value="requirements">
                <Section title="Requirements">
                  {opp.requirements.length ? <List items={opp.requirements} /> : <p className="text-sm text-muted">No specific requirements listed.</p>}
                </Section>
                <Section title="Eligibility">
                  <p className="text-sm text-ink/80">{ELIGIBILITY_LABEL[opp.eligibility]}</p>
                </Section>
              </TabsContent>
              <TabsContent value="learn">
                <Section title="What You'll Learn">
                  {opp.learnings.length ? <List items={opp.learnings} /> : <p className="text-sm text-muted">Details coming soon.</p>}
                </Section>
                {opp.benefits.length > 0 && (
                  <Section title="Benefits">
                    <List items={opp.benefits} />
                  </Section>
                )}
              </TabsContent>
              <TabsContent value="company">
                <div className="flex items-center gap-4">
                  <CompanyLogo name={c.name} logoUrl={c.logoUrl} color={c.brandColor} size="lg" rounded="xl" />
                  <div>
                    <h2 className="flex items-center gap-1.5 text-lg font-bold">
                      {c.name} {c.verified && <BadgeCheck className="size-5 fill-brand-600 text-white" />}
                    </h2>
                    <p className="text-sm text-muted">{c.industry}</p>
                  </div>
                </div>
                <p className="mt-5 text-[14.5px] leading-7 text-ink/80">{c.description ?? "No description provided yet."}</p>
                <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
                  {c.location && (
                    <div className="flex items-center gap-2 text-ink/80">
                      <MapPin className="size-4 text-brand-700" /> {c.location}
                    </div>
                  )}
                  {c.size && (
                    <div className="flex items-center gap-2 text-ink/80">
                      <Users className="size-4 text-brand-700" /> {c.size} employees
                    </div>
                  )}
                  {c.website && (
                    <a href={c.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-brand-700 hover:underline">
                      <Globe className="size-4" /> Website
                    </a>
                  )}
                </dl>
                <Link href={`/companies/${c.slug}`} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
                  <Building2 className="size-4" /> View company profile
                </Link>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="hidden gap-3 lg:flex">
              <ApplyButton
                state={applyState}
                slug={opp.slug}
                opportunityId={opp.id}
                method={opp.applicationMethod}
                externalUrl={opp.externalUrl}
                applicationEmail={opp.applicationEmail}
                title={opp.title}
                className="flex-1"
              />
              {(!user || isStudent) && (
                <SaveButton opportunityId={opp.id} saved={saved.has(opp.id)} loggedIn={!!user} className="size-12" />
              )}
            </div>

            <div className="rounded-2xl border border-line p-5">
              <dl className="space-y-4 text-sm">
                {[
                  { icon: CalendarClock, label: "Application Deadline", value: opp.deadline ? formatDate(opp.deadline) : "Rolling" },
                  {
                    icon: Send,
                    label: "Application Method",
                    value: opp.applicationMethod === "internal" ? "Apply on Internly" : opp.applicationMethod === "external" ? "Via company website" : "Via email",
                  },
                  { icon: Building2, label: "Job Type", value: TYPE_LABEL[opp.type] },
                  { icon: MapPin, label: "Location", value: `${opp.location} · ${WORK_MODE_LABEL[opp.workMode]}` },
                  { icon: CalendarDays, label: "Duration & Stipend", value: `${formatDuration(opp.durationMonths)} · ${formatStipend(opp.stipend, opp.paid)}` },
                  ...(opp.startDate ? [{ icon: CalendarDays, label: "Start Date", value: formatDate(opp.startDate) }] : []),
                  { icon: Users, label: "Openings", value: String(opp.openings) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <dt className="text-xs text-muted">{label}</dt>
                      <dd className="font-medium text-ink">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            <div className="flex gap-3 rounded-2xl bg-brand-50 p-5">
              <ShieldCheck className="size-7 shrink-0 fill-brand-800 text-brand-800 [&>path:last-child]:stroke-white" />
              <div>
                <h3 className="text-sm font-semibold">Application safety</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink/70">
                  Never pay money to apply for an internship. Report suspicious opportunities.
                </p>
                <Link
                  href={`/report?opportunity=${opp.slug}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:underline"
                >
                  <Flag className="size-3.5" /> Report this opportunity
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-line p-5">
              <h3 className="mb-4 text-sm font-semibold">Share this opportunity</h3>
              <ShareButtons url={url} title={opp.title} />
            </div>

            {similar.length > 0 && (
              <div className="rounded-2xl border border-line p-5">
                <h3 className="mb-2 text-sm font-semibold">Similar Opportunities</h3>
                <ul className="divide-y divide-line">
                  {similar.map((s) => (
                    <li key={s.id}>
                      <Link href={`/opportunities/${s.slug}`} className="flex items-center gap-3 py-3 hover:opacity-80">
                        <CompanyLogo name={s.companyName} logoUrl={s.companyLogo} color={s.companyColor} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold">{s.title}</p>
                          <p className="truncate text-xs text-muted">
                            {s.companyName} · {s.workMode === "remote" ? "Remote" : s.location}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
