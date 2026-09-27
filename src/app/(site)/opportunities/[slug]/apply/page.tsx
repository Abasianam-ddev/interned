import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ArrowLeft, ArrowRight, FileText, Pencil } from "lucide-react";
import { db } from "@/db";
import { applications, studentProfiles } from "@/db/schema";
import { saveApplicationStepAction } from "@/app/actions/student";
import { ActionForm, FieldError, SubmitButton } from "@/components/shared/action-form";
import { CompanyLogo } from "@/components/shared/company-logo";
import { FileField, SelectField, TextAreaField, TextField } from "@/components/forms/fields";
import { Stepper } from "@/components/forms/stepper";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { LEVELS } from "@/lib/constants";
import { getOpportunityBySlug } from "@/lib/queries";
import { isDeadlinePassed } from "@/lib/utils";

export const metadata: Metadata = { title: "Apply" };

export default async function ApplyPage({ params, searchParams }: PageProps<"/opportunities/[slug]/apply">) {
  const { slug } = await params;
  const sp = await searchParams;
  const user = await requireUser(["student"], `/opportunities/${slug}/apply`);
  const opp = await getOpportunityBySlug(slug);
  if (!opp || opp.status !== "published") notFound();
  if (opp.applicationMethod !== "internal") redirect(`/opportunities/${slug}`);

  const [draft, profile] = await Promise.all([
    db.query.applications.findFirst({ where: and(eq(applications.opportunityId, opp.id), eq(applications.userId, user.id)) }),
    db.query.studentProfiles.findFirst({ where: eq(studentProfiles.userId, user.id) }),
  ]);
  if (draft && draft.status !== "draft") redirect(`/dashboard/applications/${draft.id}`);
  if (isDeadlinePassed(opp.deadline)) redirect(`/opportunities/${slug}`);

  const maxStep = draft?.step ?? 1;
  const requested = Number(sp.step ?? maxStep) || 1;
  const step = Math.min(Math.max(1, requested), maxStep, 3);

  return (
    <div className="bg-canvas/60 py-10">
      <div className="container-page max-w-3xl!">
        <Link href={`/opportunities/${slug}`} className="inline-flex items-center gap-1.5 text-[13px] text-ink/70 hover:text-brand-700">
          <ArrowLeft className="size-4" /> Back to opportunity
        </Link>
        <div className="mt-5 rounded-2xl border border-line bg-white p-6 shadow-card sm:p-10">
          <Stepper steps={["Personal Info", "Documents", "Confirmation"]} current={step} />

          <div className="mt-10 flex items-center gap-4">
            <CompanyLogo name={opp.company.name} logoUrl={opp.company.logoUrl} color={opp.company.brandColor} size="lg" />
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">Apply for {opp.title}</h1>
              <p className="text-sm text-muted">{opp.company.name}</p>
            </div>
          </div>

          {step === 1 && (
            <ActionForm action={saveApplicationStepAction} className="mt-8">
              <input type="hidden" name="opportunityId" value={opp.id} />
              <input type="hidden" name="step" value="1" />
              <h2 className="mb-5 text-base font-bold">Personal Information</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField name="fullName" label="Full Name" required placeholder="John Doe" defaultValue={draft?.fullName ?? user.name} autoComplete="name" />
                <TextField name="email" type="email" label="Email Address" required placeholder="you@example.com" defaultValue={draft?.email ?? user.email} autoComplete="email" />
                <TextField name="phone" type="tel" label="Phone Number" required placeholder="+234 801 234 5678" defaultValue={draft?.phone ?? user.phone ?? ""} autoComplete="tel" />
                <TextField name="course" label="Course / Field of Study" required placeholder="e.g. Computer Science" defaultValue={draft?.course ?? profile?.course ?? ""} />
                <TextField name="school" label="School" required placeholder="e.g. University of Uyo" defaultValue={draft?.school ?? profile?.school ?? ""} />
                <SelectField name="level" label="Current Level" required options={LEVELS} placeholder="Select level" defaultValue={draft?.level ?? profile?.level ?? ""} />
              </div>
              <SubmitButton name="intent" value="next" size="lg" className="mt-8 w-full bg-brand-800 hover:bg-brand-900">
                Next: Documents <ArrowRight />
              </SubmitButton>
              <p className="mt-4 text-center text-xs text-muted">
                You can{" "}
                <button name="intent" value="save" className="font-medium text-brand-700 hover:underline">
                  save and continue later
                </button>
                .
              </p>
            </ActionForm>
          )}

          {step === 2 && draft && (
            <ActionForm action={saveApplicationStepAction} className="mt-8">
              <input type="hidden" name="opportunityId" value={opp.id} />
              <input type="hidden" name="step" value="2" />
              <h2 className="mb-5 text-base font-bold">Documents</h2>
              <div className="space-y-6">
                <div>
                  <FileField
                    name="cv"
                    label="CV / Resume"
                    required
                    current={draft.cvUrl ? { name: draft.cvName ?? "CV", url: draft.cvUrl } : null}
                  />
                  {!draft.cvUrl && profile?.cvUrl && (
                    <label className="mt-3 flex items-center gap-2.5 text-sm text-ink/80">
                      <input type="checkbox" name="useProfileCv" defaultChecked className="size-4" />
                      Use CV from my profile ({profile.cvName ?? "CV"})
                    </label>
                  )}
                </div>
                <TextAreaField
                  name="coverLetter"
                  label={opp.requireCoverLetter ? "Cover Letter" : "Cover Letter (optional)"}
                  required={opp.requireCoverLetter}
                  rows={7}
                  placeholder="Tell the company why you're interested in this opportunity and what makes you a great fit…"
                  defaultValue={draft.coverLetter ?? ""}
                  maxLength={4000}
                />
                <FileField
                  name="coverLetterFile"
                  label="Or upload a cover letter"
                  current={draft.coverLetterUrl ? { name: draft.coverLetterName ?? "Cover letter", url: draft.coverLetterUrl } : null}
                />
                <TextField
                  name="portfolioUrl"
                  label="Portfolio / LinkedIn / GitHub (optional)"
                  placeholder="https://"
                  defaultValue={draft.portfolioUrl ?? profile?.links.portfolio ?? ""}
                />
              </div>
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
                <Button asChild variant="secondary" size="lg">
                  <Link href={`/opportunities/${slug}/apply?step=1`}>
                    <ArrowLeft /> Back
                  </Link>
                </Button>
                <SubmitButton name="intent" value="next" size="lg" className="flex-1 bg-brand-800 hover:bg-brand-900">
                  Next: Confirmation <ArrowRight />
                </SubmitButton>
              </div>
              <p className="mt-4 text-center text-xs text-muted">
                You can{" "}
                <button name="intent" value="save" className="font-medium text-brand-700 hover:underline">
                  save and continue later
                </button>
                .
              </p>
            </ActionForm>
          )}

          {step === 3 && draft && (
            <ActionForm action={saveApplicationStepAction} className="mt-8">
              <input type="hidden" name="opportunityId" value={opp.id} />
              <input type="hidden" name="step" value="3" />
              <h2 className="mb-5 text-base font-bold">Review your application</h2>
              <div className="divide-y divide-line rounded-xl border border-line">
                <div className="flex items-start justify-between gap-4 p-5">
                  <dl className="grid flex-1 gap-4 text-sm sm:grid-cols-2">
                    {[
                      ["Full Name", draft.fullName],
                      ["Email", draft.email],
                      ["Phone", draft.phone],
                      ["Course", draft.course],
                      ["School", draft.school],
                      ["Level", draft.level],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-xs text-muted">{k}</dt>
                        <dd className="font-medium">{v || "—"}</dd>
                      </div>
                    ))}
                  </dl>
                  <Link href={`/opportunities/${slug}/apply?step=1`} className="text-brand-700" aria-label="Edit personal info">
                    <Pencil className="size-4" />
                  </Link>
                </div>
                <div className="flex items-start justify-between gap-4 p-5">
                  <div className="space-y-3 text-sm">
                    <p className="flex items-center gap-2">
                      <FileText className="size-4 text-brand-700" />
                      <a href={draft.cvUrl ?? "#"} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                        {draft.cvName ?? "CV"}
                      </a>
                    </p>
                    {draft.coverLetterUrl && (
                      <p className="flex items-center gap-2">
                        <FileText className="size-4 text-brand-700" />
                        <a href={draft.coverLetterUrl} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                          {draft.coverLetterName ?? "Cover letter"}
                        </a>
                      </p>
                    )}
                    {draft.coverLetter && <p className="line-clamp-4 whitespace-pre-line text-ink/75">{draft.coverLetter}</p>}
                    {draft.portfolioUrl && (
                      <p className="text-ink/75">
                        Portfolio:{" "}
                        <a href={draft.portfolioUrl} target="_blank" rel="noreferrer" className="text-brand-700 hover:underline">
                          {draft.portfolioUrl}
                        </a>
                      </p>
                    )}
                  </div>
                  <Link href={`/opportunities/${slug}/apply?step=2`} className="text-brand-700" aria-label="Edit documents">
                    <Pencil className="size-4" />
                  </Link>
                </div>
              </div>
              <label className="mt-6 flex items-start gap-3 text-sm text-ink/80">
                <input type="checkbox" name="agree" className="mt-0.5 size-4" />
                <span>
                  I confirm that the information provided is accurate and I agree to share it with {opp.company.name}.
                </span>
              </label>
              <FieldError name="agree" />
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
                <Button asChild variant="secondary" size="lg">
                  <Link href={`/opportunities/${slug}/apply?step=2`}>
                    <ArrowLeft /> Back
                  </Link>
                </Button>
                <SubmitButton size="lg" className="flex-1 bg-brand-800 hover:bg-brand-900" pendingText="Submitting…">
                  Submit Application <ArrowRight />
                </SubmitButton>
              </div>
            </ActionForm>
          )}
        </div>
      </div>
    </div>
  );
}
