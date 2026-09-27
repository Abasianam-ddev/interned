import Link from "next/link";
import { ExternalLink, FileText, GraduationCap, Mail, MapPin, Phone } from "lucide-react";
import type { Application, ApplicationStatus, StudentProfile, User } from "@/db/schema";
import { UserAvatar } from "@/components/shared/company-logo";
import { ApplicationStatusBadge } from "@/components/shared/status-badge";
import { SelectField, TextAreaField } from "@/components/forms/fields";
import { ActionForm, SubmitButton } from "@/components/shared/action-form";
import type { ActionState } from "@/lib/action-state";
import { APPLICATION_STATUS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

type Event = { id: string; status: ApplicationStatus; note: string | null; createdAt: Date };

export function ApplicantDetail({
  app,
  user,
  profile,
  events,
  opportunity,
  action,
}: {
  app: Application;
  user: Pick<User, "avatarUrl">;
  profile: StudentProfile | null | undefined;
  events: Event[];
  opportunity: { title: string; slug: string };
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
}) {
  const visible = profile?.profileVisible ?? true;
  const locked = app.status === "withdrawn";
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <UserAvatar name={app.fullName} src={user.avatarUrl} className="size-16 text-xl" />
            <div className="flex-1">
              <h1 className="text-xl font-bold">{app.fullName}</h1>
              {visible && profile?.headline && <p className="text-sm text-muted">{profile.headline}</p>}
              <p className="mt-1 text-xs text-muted">
                Applied for{" "}
                <Link href={`/opportunities/${opportunity.slug}`} className="font-medium text-brand-700 hover:underline">
                  {opportunity.title}
                </Link>{" "}
                · {formatDateTime(app.submittedAt)}
              </p>
            </div>
            <ApplicationStatusBadge status={app.status} />
          </div>
          <dl className="mt-6 grid gap-4 border-t border-line pt-5 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2.5">
              <Mail className="size-4 text-brand-700" />
              <a href={`mailto:${app.email}`} className="hover:text-brand-700">
                {app.email}
              </a>
            </div>
            {app.phone && (
              <div className="flex items-center gap-2.5">
                <Phone className="size-4 text-brand-700" />
                <a href={`tel:${app.phone}`}>{app.phone}</a>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <GraduationCap className="size-4 text-brand-700" />
              {[app.course, app.school, app.level].filter(Boolean).join(" · ") || "—"}
            </div>
            {visible && profile?.location && (
              <div className="flex items-center gap-2.5">
                <MapPin className="size-4 text-brand-700" /> {profile.location}
              </div>
            )}
          </dl>
        </section>

        <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
          <h2 className="font-bold">Documents</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {app.cvUrl && (
              <a href={app.cvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-line px-3.5 py-2 text-sm hover:bg-brand-50">
                <FileText className="size-4 text-brand-700" /> {app.cvName ?? "CV"}
              </a>
            )}
            {app.coverLetterUrl && (
              <a href={app.coverLetterUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-line px-3.5 py-2 text-sm hover:bg-brand-50">
                <FileText className="size-4 text-brand-700" /> {app.coverLetterName ?? "Cover letter"}
              </a>
            )}
            {app.portfolioUrl && (
              <a href={app.portfolioUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-line px-3.5 py-2 text-sm hover:bg-brand-50">
                <ExternalLink className="size-4 text-brand-700" /> Portfolio
              </a>
            )}
            {!app.cvUrl && !app.coverLetterUrl && !app.portfolioUrl && <p className="text-sm text-muted">No documents (applied externally).</p>}
          </div>
          {app.coverLetter && (
            <>
              <h3 className="mt-6 text-sm font-semibold">Cover letter</h3>
              <p className="mt-2 whitespace-pre-line rounded-xl bg-canvas p-4 text-sm leading-relaxed text-ink/80">{app.coverLetter}</p>
            </>
          )}
        </section>

        {visible && profile && (profile.bio || profile.skills.length > 0 || profile.experience.length > 0 || profile.projects.length > 0) && (
          <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
            <h2 className="font-bold">Profile</h2>
            {profile.bio && <p className="mt-3 text-sm leading-relaxed text-ink/80">{profile.bio}</p>}
            {profile.skills.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <span key={s} className="rounded-md bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-800">
                    {s}
                  </span>
                ))}
              </div>
            )}
            {profile.experience.length > 0 && (
              <>
                <h3 className="mt-6 text-sm font-semibold">Experience</h3>
                <ul className="mt-2 space-y-3">
                  {profile.experience.map((e, i) => (
                    <li key={i} className="text-sm">
                      <p className="font-medium">
                        {e.role} · {e.company}
                      </p>
                      {e.period && <p className="text-xs text-muted">{e.period}</p>}
                      {e.description && <p className="mt-1 text-ink/75">{e.description}</p>}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {profile.projects.length > 0 && (
              <>
                <h3 className="mt-6 text-sm font-semibold">Projects</h3>
                <ul className="mt-2 space-y-3">
                  {profile.projects.map((p, i) => (
                    <li key={i} className="text-sm">
                      <p className="font-medium">
                        {p.url ? (
                          <a href={p.url} target="_blank" rel="noreferrer" className="text-brand-700 hover:underline">
                            {p.title}
                          </a>
                        ) : (
                          p.title
                        )}
                      </p>
                      {p.description && <p className="text-ink/75">{p.description}</p>}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {Object.entries(profile.links)
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <a key={k} href={v} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 capitalize text-brand-700 hover:underline">
                    <ExternalLink className="size-3.5" /> {k}
                  </a>
                ))}
            </div>
          </section>
        )}
      </div>

      <aside className="space-y-6">
        <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
          <h2 className="font-bold">Update status</h2>
          {locked ? (
            <p className="mt-3 text-sm text-muted">The applicant withdrew this application.</p>
          ) : (
            <ActionForm action={action} className="mt-4 space-y-4">
              <input type="hidden" name="applicationId" value={app.id} />
              <SelectField
                name="status"
                label="Status"
                defaultValue={app.status === "submitted" ? "under_review" : app.status}
                options={(["under_review", "shortlisted", "interview", "accepted", "rejected"] as const).map((s) => ({
                  value: s,
                  label: APPLICATION_STATUS[s].label,
                }))}
              />
              <TextAreaField
                name="note"
                label="Message to applicant (optional)"
                rows={4}
                placeholder="e.g. Interview on Monday at 10am via Google Meet…"
              />
              <SubmitButton className="w-full">Update & Notify</SubmitButton>
            </ActionForm>
          )}
        </section>
        <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
          <h2 className="font-bold">Timeline</h2>
          <ol className="relative mt-5 space-y-5 border-l border-line pl-5">
            {[...events].reverse().map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute -left-[26px] top-1 size-3 rounded-full border-2 border-white bg-brand-600 ring-1 ring-brand-200" />
                <p className="text-sm font-semibold">{APPLICATION_STATUS[e.status].label}</p>
                {e.note && <p className="text-xs text-ink/70">{e.note}</p>}
                <p className="text-[11px] text-muted">{formatDateTime(e.createdAt)}</p>
              </li>
            ))}
          </ol>
        </section>
      </aside>
    </div>
  );
}
