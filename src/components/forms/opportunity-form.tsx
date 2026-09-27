"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Send, Save } from "lucide-react";
import type { ActionState } from "@/lib/action-state";
import { ActionForm, SubmitButton, useActionForm } from "@/components/shared/action-form";
import { SelectField, TextAreaField, TextField } from "@/components/forms/fields";
import { Stepper } from "@/components/forms/stepper";
import { TagInput } from "@/components/forms/tag-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { ELIGIBILITY, LOCATIONS, OPPORTUNITY_TYPES, WORK_MODES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type OpportunityDefaults = {
  id?: string;
  title?: string;
  fieldId?: string | null;
  type?: string;
  workMode?: string;
  location?: string;
  eligibility?: string;
  paid?: boolean;
  stipend?: number | null;
  durationMonths?: number | null;
  openings?: number;
  summary?: string | null;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  learnings?: string[];
  benefits?: string[];
  skills?: string[];
  applicationMethod?: string;
  externalUrl?: string | null;
  applicationEmail?: string | null;
  requireCoverLetter?: boolean;
  deadline?: string | null;
  startDate?: string | null;
};

const STEP_FIELDS: string[][] = [
  ["title", "fieldId", "type", "workMode", "location", "eligibility", "paid", "stipend", "durationMonths", "openings", "deadline", "startDate", "companyId"],
  ["summary", "description", "requirements", "responsibilities", "learnings", "benefits", "skills"],
  ["applicationMethod", "externalUrl", "applicationEmail"],
];

function StepJumper({ setStep }: { setStep: (n: number) => void }) {
  const { state } = useActionForm();
  React.useEffect(() => {
    const keys = Object.keys(state.fieldErrors ?? {});
    if (!keys.length) return;
    const idx = STEP_FIELDS.findIndex((fs) => fs.some((f) => keys.includes(f)));
    if (idx >= 0) setStep(idx + 1);
  }, [state, setStep]);
  return null;
}

export function OpportunityForm({
  action,
  fields,
  defaults = {},
  adminSlot,
  submitLabel = "Publish Opportunity",
  showDraft = true,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  fields: { id: string; name: string }[];
  defaults?: OpportunityDefaults;
  adminSlot?: React.ReactNode;
  submitLabel?: string;
  showDraft?: boolean;
}) {
  const [step, setStep] = React.useState(1);
  const [paid, setPaid] = React.useState(defaults.paid === false ? "unpaid" : "paid");
  const [method, setMethod] = React.useState(defaults.applicationMethod ?? "internal");
  const formRef = React.useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().slice(0, 10);
  const go = (n: number) => {
    setStep(n);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={formRef} className="scroll-mt-24 rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
      <Stepper steps={["Details", "Requirements", "Application & Review"]} current={step} />
      <ActionForm action={action} className="mt-8" noValidate>
        <StepJumper setStep={setStep} />
        {defaults.id && <input type="hidden" name="id" value={defaults.id} />}

        {/* Step 1 */}
        <div className={cn("space-y-5", step !== 1 && "hidden")}>
          {adminSlot}
          <TextField name="title" label="Opportunity Title" required defaultValue={defaults.title} placeholder="e.g. Frontend Developer Intern" />
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              name="fieldId"
              label="Field"
              required
              placeholder="Select field"
              defaultValue={defaults.fieldId ?? ""}
              options={fields.map((f) => ({ value: f.id, label: f.name }))}
            />
            <SelectField name="type" label="Type" required defaultValue={defaults.type ?? "internship"} options={OPPORTUNITY_TYPES} />
            <SelectField name="workMode" label="Work mode" required defaultValue={defaults.workMode ?? "onsite"} options={WORK_MODES} />
            <div>
              <TextField name="location" label="Location (city)" required list="locations" defaultValue={defaults.location} placeholder="e.g. Lagos" />
              <datalist id="locations">
                {LOCATIONS.filter((l) => l !== "Remote").map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
            </div>
            <SelectField name="eligibility" label="Who can apply" defaultValue={defaults.eligibility ?? "students"} options={ELIGIBILITY} />
            <TextField name="durationMonths" type="number" min={1} max={24} label="Duration (months)" defaultValue={defaults.durationMonths ?? 3} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>Stipend</Label>
              <div className="flex gap-2">
                {(["paid", "unpaid"] as const).map((v) => (
                  <label
                    key={v}
                    className={cn(
                      "flex h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border text-sm font-medium capitalize",
                      paid === v ? "border-brand-600 bg-brand-50 text-brand-800" : "border-line",
                    )}
                  >
                    <input type="radio" name="paid" value={v} checked={paid === v} onChange={() => setPaid(v)} className="sr-only" />
                    {v}
                  </label>
                ))}
              </div>
            </div>
            {paid === "paid" && (
              <TextField name="stipend" label="Monthly stipend (₦)" inputMode="numeric" required defaultValue={defaults.stipend ?? ""} placeholder="100,000" />
            )}
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <TextField name="deadline" type="date" label="Application deadline" required min={defaults.id ? undefined : today} defaultValue={defaults.deadline ?? ""} />
            <TextField name="startDate" type="date" label="Start date" defaultValue={defaults.startDate ?? ""} />
            <TextField name="openings" type="number" min={1} max={500} label="Openings" defaultValue={defaults.openings ?? 1} />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="button" onClick={() => go(2)}>
              Next: Requirements <ArrowRight />
            </Button>
          </div>
        </div>

        {/* Step 2 */}
        <div className={cn("space-y-5", step !== 2 && "hidden")}>
          <TextField name="summary" label="Short summary" maxLength={240} defaultValue={defaults.summary ?? ""} placeholder="One sentence shown in search results and shares" />
          <TextAreaField
            name="description"
            label="About the opportunity"
            required
            rows={7}
            defaultValue={defaults.description}
            placeholder="Describe the role, the team and what interns will work on…"
          />
          <div className="grid gap-5 lg:grid-cols-2">
            <TextAreaField name="responsibilities" label="Responsibilities" hint="One per line" rows={5} defaultValue={defaults.responsibilities?.join("\n")} />
            <TextAreaField name="requirements" label="Requirements" hint="One per line" rows={5} defaultValue={defaults.requirements?.join("\n")} />
            <TextAreaField name="learnings" label="What interns will learn" hint="One per line" rows={5} defaultValue={defaults.learnings?.join("\n")} />
            <TextAreaField name="benefits" label="Benefits" hint="One per line" rows={5} defaultValue={defaults.benefits?.join("\n")} />
          </div>
          <div>
            <Label>Skills</Label>
            <TagInput name="skills" defaultValue={defaults.skills ?? []} placeholder="e.g. React, Excel, Figma" />
          </div>
          <div className="flex justify-between pt-2">
            <Button type="button" variant="secondary" onClick={() => go(1)}>
              <ArrowLeft /> Back
            </Button>
            <Button type="button" onClick={() => go(3)}>
              Next: Application <ArrowRight />
            </Button>
          </div>
        </div>

        {/* Step 3 */}
        <div className={cn("space-y-5", step !== 3 && "hidden")}>
          <div>
            <Label>How should students apply?</Label>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { v: "internal", t: "On Internly", d: "Recommended — manage applicants in your dashboard" },
                { v: "external", t: "External link", d: "Send students to your careers page" },
                { v: "email", t: "By email", d: "Students email their CV to you" },
              ].map((o) => (
                <label
                  key={o.v}
                  className={cn(
                    "cursor-pointer rounded-xl border p-4 transition",
                    method === o.v ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600" : "border-line hover:border-brand-300",
                  )}
                >
                  <input type="radio" name="applicationMethod" value={o.v} checked={method === o.v} onChange={() => setMethod(o.v)} className="sr-only" />
                  <span className="block text-sm font-semibold">{o.t}</span>
                  <span className="mt-1 block text-xs text-muted">{o.d}</span>
                </label>
              ))}
            </div>
          </div>
          {method === "external" && (
            <TextField name="externalUrl" label="Application link" required defaultValue={defaults.externalUrl ?? ""} placeholder="https://careers.yourcompany.com/…" />
          )}
          {method === "email" && (
            <TextField name="applicationEmail" type="email" label="Application email" required defaultValue={defaults.applicationEmail ?? ""} placeholder="careers@yourcompany.com" />
          )}
          {method === "internal" && (
            <label className="flex items-center gap-2.5 text-sm">
              <input type="checkbox" name="requireCoverLetter" defaultChecked={defaults.requireCoverLetter} className="size-4" />
              Require a cover letter
            </label>
          )}
          <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-900">
            <strong>Before you publish:</strong> make sure the opportunity is genuine and never asks applicants for payment. Listings that
            break our rules are removed.
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
            <Button type="button" variant="secondary" onClick={() => go(2)}>
              <ArrowLeft /> Back
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row">
              {showDraft && (
                <SubmitButton name="intent" value="draft" variant="secondary">
                  <Save /> Save as draft
                </SubmitButton>
              )}
              <SubmitButton name="intent" value="submit" pendingText="Saving…">
                <Send /> {submitLabel}
              </SubmitButton>
            </div>
          </div>
        </div>
      </ActionForm>
    </div>
  );
}
