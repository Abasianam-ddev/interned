import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { reportAction } from "@/app/actions/public";
import { ActionForm, SubmitButton } from "@/components/shared/action-form";
import { SelectField, TextAreaField, TextField } from "@/components/forms/fields";
import { CompanyLogo } from "@/components/shared/company-logo";
import { getCurrentUser } from "@/lib/auth";
import { REPORT_REASONS } from "@/lib/constants";
import { getOpportunityBySlug } from "@/lib/queries";

export const metadata: Metadata = { title: "Report an Opportunity" };

export default async function ReportPage({ searchParams }: PageProps<"/report">) {
  const sp = await searchParams;
  const slug = typeof sp.opportunity === "string" ? sp.opportunity : "";
  const [opp, user] = await Promise.all([slug ? getOpportunityBySlug(slug) : null, getCurrentUser()]);
  return (
    <div className="bg-canvas/60 py-12">
      <div className="container-page max-w-2xl!">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-10">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShieldAlert className="size-6" />
          </div>
          <h1 className="mt-5 text-2xl font-bold">Report an Opportunity</h1>
          <p className="mt-2 text-sm text-muted">
            Help us keep Internly safe. Reports are confidential and reviewed by our trust &amp; safety team.
          </p>
          {opp && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-line bg-canvas/60 p-4">
              <CompanyLogo name={opp.company.name} logoUrl={opp.company.logoUrl} color={opp.company.brandColor} size="md" />
              <div>
                <p className="text-sm font-semibold">{opp.title}</p>
                <p className="text-xs text-muted">{opp.company.name}</p>
              </div>
            </div>
          )}
          <ActionForm action={reportAction} resetOnSuccess className="mt-6 space-y-5">
            <input type="hidden" name="opportunity" value={opp?.slug ?? ""} />
            <SelectField name="reason" label="Reason" required options={REPORT_REASONS} placeholder="Select a reason" />
            <TextAreaField
              name="details"
              label={opp ? "Additional details" : "Which opportunity or company? Add details"}
              rows={5}
              placeholder="Describe what happened, include links if possible…"
            />
            {!user && <TextField name="email" type="email" label="Your email (optional)" placeholder="So we can follow up" />}
            <SubmitButton variant="danger" size="lg" className="w-full">
              Submit Report
            </SubmitButton>
          </ActionForm>
        </div>
      </div>
    </div>
  );
}
