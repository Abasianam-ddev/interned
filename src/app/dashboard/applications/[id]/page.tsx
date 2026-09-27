import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { ArrowLeft, Check, ExternalLink, FileText, X } from "lucide-react";
import { db } from "@/db";
import { applicationEvents, applications } from "@/db/schema";
import { WithdrawButton } from "@/components/dashboard/withdraw-button";
import { CompanyLogo } from "@/components/shared/company-logo";
import { ApplicationStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { APPLICATION_PIPELINE, APPLICATION_STATUS } from "@/lib/constants";
import { cn, formatDate, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Application Details" };

export default async function ApplicationDetailPage({ params }: PageProps<"/dashboard/applications/[id]">) {
  const { id } = await params;
  const user = await requireUser(["student"]);
  const app = await db.query.applications.findFirst({
    where: and(eq(applications.id, id), eq(applications.userId, user.id)),
    with: { opportunity: { with: { company: true } }, events: { orderBy: asc(applicationEvents.createdAt) } },
  });
  if (!app) notFound();
  const o = app.opportunity;
  const terminal = app.status === "rejected" || app.status === "withdrawn";
  const currentIdx = APPLICATION_PIPELINE.indexOf(app.status);
  const reachedIdx = terminal
    ? Math.max(...app.events.map((e) => APPLICATION_PIPELINE.indexOf(e.status)), 0)
    : currentIdx;

  return (
    <>
      <Link href="/dashboard/applications" className="inline-flex items-center gap-1.5 text-sm text-ink/70 hover:text-brand-700">
        <ArrowLeft className="size-4" /> Application Details
      </Link>
      <div className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <CompanyLogo name={o.company.name} logoUrl={o.company.logoUrl} color={o.company.brandColor} size="lg" />
            <div>
              <Link href={`/opportunities/${o.slug}`} className="text-lg font-bold hover:text-brand-700">
                {o.title}
              </Link>
              <p className="text-sm text-muted">{o.company.name}</p>
            </div>
          </div>
          <ApplicationStatusBadge status={app.status} />
        </div>

        {/* Pipeline */}
        <ol className="mt-10 grid grid-cols-5 gap-2">
          {APPLICATION_PIPELINE.map((s, i) => {
            const done = i <= reachedIdx;
            const failedHere = terminal && i === reachedIdx + 1;
            return (
              <li key={s} className="relative flex flex-col items-center text-center">
                {i > 0 && (
                  <span className={cn("absolute right-1/2 top-4 h-0.5 w-full", i <= reachedIdx ? "bg-brand-600" : "bg-line")} aria-hidden />
                )}
                <span
                  className={cn(
                    "relative z-10 flex size-8 items-center justify-center rounded-full border-2 bg-white",
                    done ? "border-brand-600 bg-brand-600 text-white" : failedHere ? "border-red-500 bg-red-500 text-white" : "border-line text-muted",
                  )}
                >
                  {done ? <Check className="size-4" strokeWidth={3} /> : failedHere ? <X className="size-4" strokeWidth={3} /> : <span className="size-2 rounded-full bg-line" />}
                </span>
                <span className={cn("mt-2 text-[11px] font-medium sm:text-xs", done ? "text-brand-800" : failedHere ? "text-red-600" : "text-muted")}>
                  {failedHere ? APPLICATION_STATUS[app.status].label : s === "submitted" ? "Application Submitted" : APPLICATION_STATUS[s].label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
          <h2 className="font-bold">Application Information</h2>
          <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted">Application Date</dt>
              <dd className="font-medium">{formatDateTime(app.submittedAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Application Method</dt>
              <dd className="font-medium">{o.applicationMethod === "internal" ? "Online Application" : o.applicationMethod === "external" ? "External Website" : "Email"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Name</dt>
              <dd className="font-medium">{app.fullName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Contact</dt>
              <dd className="font-medium">
                {app.email}
                {app.phone && ` · ${app.phone}`}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">School & Course</dt>
              <dd className="font-medium">{[app.school, app.course, app.level].filter(Boolean).join(" · ") || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Deadline</dt>
              <dd className="font-medium">{formatDate(o.deadline)}</dd>
            </div>
          </dl>
          <h3 className="mt-8 text-sm font-semibold">Documents</h3>
          <div className="mt-3 flex flex-wrap gap-3">
            {[
              { url: app.cvUrl, label: "CV", name: app.cvName },
              { url: app.coverLetterUrl, label: "Cover Letter", name: app.coverLetterName },
              { url: app.portfolioUrl, label: "Portfolio", name: null },
            ].map((d) => (
              <a
                key={d.label}
                href={d.url ?? undefined}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[13px]",
                  d.url ? "border-line hover:border-brand-300 hover:bg-brand-50" : "pointer-events-none border-dashed border-line text-muted",
                )}
              >
                {d.label === "Portfolio" ? <ExternalLink className="size-4" /> : <FileText className="size-4" />}
                {d.label} <span className="text-muted">({d.url ? "Uploaded" : "Not provided"})</span>
              </a>
            ))}
          </div>
          {app.coverLetter && (
            <>
              <h3 className="mt-8 text-sm font-semibold">Cover letter</h3>
              <p className="mt-2 whitespace-pre-line rounded-xl bg-canvas p-4 text-sm leading-relaxed text-ink/80">{app.coverLetter}</p>
            </>
          )}
          <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-6">
            <Button asChild variant="secondary">
              <Link href={`/opportunities/${o.slug}`}>View Opportunity</Link>
            </Button>
            {!["accepted", "rejected", "withdrawn"].includes(app.status) && <WithdrawButton id={app.id} />}
          </div>
        </div>
        <aside className="rounded-2xl border border-line bg-white p-6 shadow-card">
          <h2 className="font-bold">Timeline</h2>
          <ol className="relative mt-5 space-y-6 border-l border-line pl-5">
            {[...app.events].reverse().map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute -left-[26px] top-1 size-3 rounded-full border-2 border-white bg-brand-600 ring-1 ring-brand-200" />
                <p className="text-sm font-semibold">{APPLICATION_STATUS[e.status].label}</p>
                {e.note && <p className="text-xs text-ink/70">{e.note}</p>}
                <p className="text-[11px] text-muted">{formatDateTime(e.createdAt)}</p>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </>
  );
}
