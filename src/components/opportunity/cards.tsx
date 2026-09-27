import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CompanyLogo } from "@/components/shared/company-logo";
import { Tag, VerifiedBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OpportunityCardData } from "@/lib/queries";
import { ELIGIBILITY_LABEL, WORK_MODE_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Deadline, OpportunityMeta } from "./meta";
import { SaveButton } from "./save-button";

function Tags({ o, compact }: { o: OpportunityCardData; compact?: boolean }) {
  const eligibility = compact && o.eligibility === "both" ? "Students & Graduates" : ELIGIBILITY_LABEL[o.eligibility];
  return (
    <div className="flex flex-wrap gap-2">
      {o.fieldName && <Tag>{o.fieldName}</Tag>}
      <Tag>{WORK_MODE_LABEL[o.workMode]}</Tag>
      <Tag>{eligibility}</Tag>
    </div>
  );
}

/** Grid card used on the home page and dashboards. */
export function OpportunityCard({ o, className }: { o: OpportunityCardData; className?: string }) {
  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-2xl border border-line bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-float",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <CompanyLogo name={o.companyName} logoUrl={o.companyLogo} color={o.companyColor} size="md" />
        <VerifiedBadge verified={o.verified} />
      </div>
      <h3 className="mt-3 text-[15px] font-bold leading-snug text-ink">
        <Link href={`/opportunities/${o.slug}`} className="after:absolute after:inset-0">
          {o.title}
        </Link>
      </h3>
      <p className="mt-1 text-[13px] text-ink/75">{o.companyName}</p>
      <OpportunityMeta
        className="mt-4 gap-x-4 text-[11.5px] [&_svg]:size-[15px]"
        location={o.workMode === "remote" ? "Remote" : o.location}
        stipend={o.stipend}
        paid={o.paid}
        durationMonths={o.durationMonths}
      />
      <div className="mt-4">
        <Tags o={o} compact />
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
        <Deadline date={o.deadline} />
        <Button asChild variant="primary" size="sm" className="relative z-10 bg-brand-700 hover:bg-brand-800">
          <Link href={`/opportunities/${o.slug}`}>
            View Opportunity <ArrowRight />
          </Link>
        </Button>
      </div>
    </article>
  );
}

/** Horizontal row used on the opportunities list and search results. */
export function OpportunityRow({
  o,
  saved,
  loggedIn,
  applied,
}: {
  o: OpportunityCardData;
  saved?: boolean;
  loggedIn?: boolean;
  applied?: boolean;
}) {
  return (
    <article className="group relative flex gap-4 rounded-2xl border border-line bg-white p-5 shadow-card transition hover:border-brand-200 sm:gap-5">
      <CompanyLogo name={o.companyName} logoUrl={o.companyLogo} color={o.companyColor} size="lg" className="hidden sm:flex" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <CompanyLogo name={o.companyName} logoUrl={o.companyLogo} color={o.companyColor} size="sm" className="sm:hidden" />
          <VerifiedBadge verified={o.verified} />
          {o.featured && (
            <span className="rounded-full bg-brand-900 px-2 py-0.5 text-[11px] font-medium text-white">Featured</span>
          )}
          {applied && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">Applied</span>}
        </div>
        <h3 className="mt-2 text-base font-bold text-ink">
          <Link href={`/opportunities/${o.slug}`} className="after:absolute after:inset-0">
            {o.title}
          </Link>
        </h3>
        <p className="mt-0.5 text-sm text-ink/70">{o.companyName}</p>
        <OpportunityMeta
          className="mt-3"
          location={o.workMode === "remote" ? "Remote" : o.location}
          stipend={o.stipend}
          paid={o.paid}
          durationMonths={o.durationMonths}
        />
        <div className="mt-3">
          <Tags o={o} />
        </div>
        <Deadline date={o.deadline} className="mt-3 sm:hidden" />
      </div>
      <div className="flex flex-col items-end justify-between gap-3">
        <Deadline date={o.deadline} className="hidden sm:inline-flex" />
        <div className="relative z-10 flex items-center gap-2">
          {loggedIn !== undefined && <SaveButton opportunityId={o.id} saved={!!saved} loggedIn={loggedIn} />}
          <Button asChild variant="dark" size="md" className="px-5">
            <Link href={`/opportunities/${o.slug}`}>
              View <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
