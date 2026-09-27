import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Briefcase, CalendarDays, Globe, Mail, MapPin, Users } from "lucide-react";
import { OpportunityRow } from "@/components/opportunity/cards";
import { CompanyLogo } from "@/components/shared/company-logo";
import { EmptyState } from "@/components/shared/empty-state";
import { SafeImg } from "@/components/shared/safe-img";
import { LinkedInIcon, XIcon, InstagramIcon } from "@/components/shared/brand-icons";
import { getCurrentUser } from "@/lib/auth";
import { getCompanyBySlug, getSavedIds, searchOpportunities } from "@/lib/queries";

export async function generateMetadata({ params }: PageProps<"/companies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCompanyBySlug(slug);
  return { title: c?.name ?? "Company", description: c?.tagline ?? undefined };
}

export default async function CompanyPage({ params }: PageProps<"/companies/[slug]">) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company || company.status === "suspended") notFound();
  const user = await getCurrentUser();
  const isStudent = user?.role === "student";
  const [{ items, total }, saved] = await Promise.all([
    searchOpportunities({ company: slug, perPage: 50 }),
    getSavedIds(isStudent ? user.id : undefined),
  ]);
  const socials = [
    { href: company.socials.linkedin, icon: LinkedInIcon, label: "LinkedIn" },
    { href: company.socials.twitter, icon: XIcon, label: "X" },
    { href: company.socials.instagram, icon: InstagramIcon, label: "Instagram" },
  ].filter((s) => s.href);

  return (
    <div className="bg-canvas/60 pb-16">
      <div className="relative h-48 bg-brand-900 sm:h-64">
        {company.coverUrl && (
          <SafeImg
            src={company.coverUrl}
            alt=""
            className="size-full object-cover opacity-80"
            fallback={<div className="size-full bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950" />}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/50 to-transparent" />
      </div>
      <div className="container-page">
        <div className="relative -mt-16 rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
          <Link href="/companies" className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-ink/70 hover:text-brand-700">
            <ArrowLeft className="size-4" /> All companies
          </Link>
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <CompanyLogo name={company.name} logoUrl={company.logoUrl} color={company.brandColor} size="xl" rounded="xl" className="-mt-2 ring-4 ring-white" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold sm:text-3xl">{company.name}</h1>
                {company.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-800">
                    <BadgeCheck className="size-3.5 fill-brand-600 text-white" /> Verified Company
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink/70">
                {company.industry && <span>{company.industry}</span>}
                {company.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4" /> {company.location}
                  </span>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-brand-700 hover:underline">
                    <Globe className="size-4" /> {company.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
              {company.description && <p className="mt-5 max-w-3xl text-[14.5px] leading-7 text-ink/80">{company.description}</p>}
            </div>
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-6 sm:grid-cols-4">
            {[
              { icon: Briefcase, label: "Open internships", value: total },
              { icon: Users, label: "Employees", value: company.size ?? "—" },
              { icon: CalendarDays, label: "Founded", value: company.foundedYear ?? "—" },
              { icon: Mail, label: "Contact", value: company.email ?? "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <dd className="truncate font-display font-bold">{value}</dd>
                  <dt className="text-xs text-muted">{label}</dt>
                </div>
              </div>
            ))}
          </dl>
          {socials.length > 0 && (
            <div className="mt-6 flex gap-2">
              {socials.map(({ href, icon: Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="flex size-9 items-center justify-center rounded-full border border-line hover:bg-brand-50">
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-bold">Available Internships ({total})</h2>
          {items.length ? (
            <div className="mt-5 space-y-4">
              {items.map((o) => (
                <OpportunityRow key={o.id} o={o} saved={saved.has(o.id)} loggedIn={user && !isStudent ? undefined : isStudent} />
              ))}
            </div>
          ) : (
            <EmptyState icon={Briefcase} title="No open opportunities right now" description="Check back soon or set up alerts." className="mt-5" />
          )}
        </section>
      </div>
    </div>
  );
}
