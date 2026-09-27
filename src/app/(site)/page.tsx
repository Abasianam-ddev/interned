import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  ChevronDown,
  Flame,
  GraduationCap,
  Search,
  Send,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { OpportunityCard } from "@/components/opportunity/cards";
import { AlertCard } from "@/components/home/alert-card";
import { HeroSearch } from "@/components/home/hero-search";
import { HeroFallback } from "@/components/home/hero-fallback";
import { CompanyLogo } from "@/components/shared/company-logo";
import { FieldIcon } from "@/components/shared/field-icon";
import { SafeImg } from "@/components/shared/safe-img";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { RESOURCE_CATEGORY_LABEL } from "@/lib/constants";
import {
  getCompaniesWithCounts,
  getFieldsWithCounts,
  getLatestOpportunities,
  getPublishedResources,
} from "@/lib/queries";
import { getSettings } from "@/lib/settings";

export default async function HomePage() {
  const [settings, user, latest, fieldList, topCompanies, articles] = await Promise.all([
    getSettings(),
    getCurrentUser(),
    getLatestOpportunities(6),
    getFieldsWithCounts(),
    getCompaniesWithCounts({ limit: 8 }),
    getPublishedResources({ limit: 3 }),
  ]);

  const chips = [
    { label: "Remote", href: "/opportunities?mode=remote" },
    { label: "IT / SIWES", href: "/opportunities?type=siwes" },
    ...fieldList.slice(0, 6).map((f) => ({ label: f.name, href: `/opportunities?field=${f.slug}` })),
  ];

  return (
    <>
      {/* ------------------------------ Hero ------------------------------ */}
      <section className="relative overflow-hidden bg-canvas">
        <div className="absolute inset-y-0 right-0 hidden w-[62%] md:block">
          <SafeImg
            src={settings.heroImage}
            alt="Student smiling on campus"
            className="size-full object-cover object-[center_20%]"
            fallback={<HeroFallback className="size-full" />}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-canvas/60 to-transparent" />
        </div>
        <p
          aria-hidden
          className="absolute right-[6%] top-20 hidden max-w-[220px] -rotate-6 text-right font-script text-[42px] leading-[1.05] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] xl:block"
        >
          {settings.heroScript}
          <svg viewBox="0 0 160 16" className="ml-auto mt-1 h-4 w-40 text-brand-300">
            <path d="M2 13C50 4 110 2 158 3" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
        </p>

        <div className="container-page relative pb-10 pt-8 md:pb-12 md:pt-10">
          <span className="inline-flex items-center gap-2.5 rounded-full bg-brand-100/90 px-3.5 py-1.5 text-[12.5px] font-medium text-ink/85 ring-1 ring-brand-200/70">
            <GraduationCap className="size-[18px] text-brand-900" />
            {settings.heroBadge}
          </span>
          <h1 className="mt-6 font-display text-[44px] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink sm:text-6xl lg:text-[64px]">
            {settings.heroTitleLine1}
            <br />
            <span className="text-brand-700">{settings.heroTitleLine2}</span>
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink/80">{settings.heroSubtitle}</p>

          <HeroSearch fields={fieldList} className="mt-8 max-w-[960px]" />

          <div className="mt-5 flex max-w-[960px] flex-wrap gap-2.5">
            {chips.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="rounded-full bg-brand-100/90 px-4 py-2 text-[12.5px] font-medium text-ink/85 ring-1 ring-brand-200/60 transition hover:bg-brand-200"
              >
                {c.label}
              </Link>
            ))}
            <Link
              href="/fields"
              className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-[12.5px] font-medium text-ink/85 ring-1 ring-line transition hover:bg-brand-50"
            >
              More <ChevronDown className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------ Latest + sidebar ------------------------------ */}
      <section className="container-page grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-6 xl:gap-8">
        <div className="lg:pt-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Flame className="mt-0.5 size-8 fill-orange-400 text-orange-500" />
              <div>
                <h2 className="text-2xl font-bold text-ink">Latest Opportunities</h2>
                <p className="mt-1 text-[13.5px] text-ink/70">
                  Handpicked internships and opportunities from trusted companies.
                </p>
              </div>
            </div>
            <Link
              href="/opportunities"
              className="mt-2 inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-brand-800 hover:underline"
            >
              View all <ArrowRight className="size-4" />
            </Link>
          </div>
          {latest.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {latest.map((o) => (
                <OpportunityCard key={o.id} o={o} />
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
              New opportunities are on the way. Check back soon.
            </p>
          )}
        </div>
        <aside className="space-y-6">
          <AlertCard loggedIn={user?.role === "student"} />
          <div className="rounded-2xl border border-line bg-white px-6 py-2 shadow-card">
            {[
              {
                icon: ShieldCheck,
                title: "Verified Opportunities",
                text: "We check the legitimacy of every opportunity before it goes live.",
              },
              { icon: Users, title: "Student Focused", text: "Built for students and early career professionals like you." },
              { icon: Zap, title: "Easy Application", text: "Apply directly or through trusted external links." },
            ].map(({ icon: Icon, title, text }, i) => (
              <div key={title} className={`flex gap-4 py-5 ${i ? "border-t border-line" : ""}`}>
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-50">
                  <Icon className="size-7 fill-brand-700 text-brand-700 [&>path:last-child]:stroke-white" />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-ink">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-ink/65">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {/* ------------------------------ Stats band ------------------------------ */}
      <section className="bg-canvas">
        <div className="container-page flex flex-col gap-6 py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Users className="size-9 fill-brand-900 text-brand-900" />
            <div>
              <p className="text-[14px] font-semibold text-ink">Trusted by thousands of students</p>
              <p className="text-xs text-ink/60">Join a growing community of dreamers, doers and future leaders.</p>
            </div>
          </div>
          <dl className="grid grid-cols-3 divide-x divide-line">
            {[
              { icon: Briefcase, value: settings.statOpportunities, label: "Opportunities" },
              { icon: Building2, value: settings.statCompanies, label: "Verified Companies" },
              { icon: GraduationCap, value: settings.statStudents, label: "Students & Graduates" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3 px-4 sm:px-10 first:pl-0 last:pr-0">
                <Icon className="hidden size-8 text-brand-900 sm:block" />
                <div>
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-base font-bold text-ink">{value}</dd>
                  <dd className="text-[11px] text-ink/60">{label}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------ How it works ------------------------------ */}
      <section className="container-page grid gap-6 py-16 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-line bg-white p-8 shadow-card">
          <h2 className="text-2xl font-bold">How Internly Works</h2>
          <p className="mt-1 text-sm text-muted">Three simple steps between you and real-world experience.</p>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {[
              { icon: Search, title: "1. Search", text: "Find internships that match your interests, skills and location." },
              { icon: BadgeCheck, title: "2. Explore", text: "Review requirements, duration, stipend and what you'll learn." },
              { icon: Send, title: "3. Apply", text: "Submit your application directly and track its progress." },
            ].map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <div className="flex size-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-brand-900 p-8 text-white">
          <div className="absolute -right-10 -top-10 size-48 rounded-full bg-brand-700/50" />
          <div className="absolute -bottom-16 right-10 size-40 rounded-full bg-brand-800" />
          <div className="relative">
            <h2 className="text-2xl font-bold">Looking for interns?</h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/75">
              Find talented students ready to learn and contribute. Post an opportunity in minutes and manage applicants
              in one place.
            </p>
            <Button asChild className="mt-8 bg-white text-brand-900 hover:bg-brand-50">
              <Link href={user?.role === "company" ? "/company/opportunities/new" : "/post-opportunity"}>
                Post an Internship <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ------------------------------ Fields ------------------------------ */}
      {fieldList.length > 0 && (
        <section className="bg-canvas py-16">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Explore by Field</h2>
                <p className="mt-1 text-sm text-muted">Find opportunities in your area of interest.</p>
              </div>
              <Link href="/fields" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-800 hover:underline">
                All fields <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {fieldList.slice(0, 8).map((f) => (
                <Link
                  key={f.id}
                  href={`/opportunities?field=${f.slug}`}
                  className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 transition hover:border-brand-300 hover:shadow-card"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                    <FieldIcon name={f.icon} className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold">{f.name}</h3>
                    <p className="text-xs text-muted">{f.count} opportunities</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------ Companies ------------------------------ */}
      {topCompanies.length > 0 && (
        <section className="container-page py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Top Companies Hiring Interns</h2>
              <p className="mt-1 text-sm text-muted">Work with leading companies and build your future.</p>
            </div>
            <Link href="/companies" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-800 hover:underline">
              View all <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {topCompanies.map((c) => (
              <Link
                key={c.id}
                href={`/companies/${c.slug}`}
                className="rounded-2xl border border-line bg-white p-5 transition hover:border-brand-300 hover:shadow-card"
              >
                <CompanyLogo name={c.name} logoUrl={c.logoUrl} color={c.brandColor} size="md" rounded="xl" />
                <h3 className="mt-4 flex items-center gap-1.5 text-[15px] font-semibold">
                  <span className="truncate">{c.name}</span>
                  {c.verified && <BadgeCheck className="size-4 shrink-0 fill-brand-600 text-white" />}
                </h3>
                <p className="text-xs text-muted">{c.industry ?? "Company"}</p>
                <p className="mt-3 text-xs font-medium text-brand-700">
                  {c.openings} open {c.openings === 1 ? "opportunity" : "opportunities"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------ Resources ------------------------------ */}
      {articles.length > 0 && (
        <section className="bg-canvas py-16">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Career Resources</h2>
                <p className="mt-1 text-sm text-muted">Guides, tips and articles to help you build a successful career.</p>
              </div>
              <Link href="/resources" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-800 hover:underline">
                All resources <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {articles.map((a) => (
                <Link
                  key={a.id}
                  href={`/resources/${a.slug}`}
                  className="group overflow-hidden rounded-2xl border border-line bg-white transition hover:shadow-card"
                >
                  <SafeImg src={a.coverUrl ?? undefined} alt="" className="aspect-[16/9] w-full object-cover" />
                  <div className="p-5">
                    <p className="text-xs font-medium text-brand-700">
                      {RESOURCE_CATEGORY_LABEL[a.category] ?? a.category} · {a.readMinutes} min read
                    </p>
                    <h3 className="mt-2 font-semibold leading-snug group-hover:text-brand-800">{a.title}</h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
                      Read more <ArrowRight className="size-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
