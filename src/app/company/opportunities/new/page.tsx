import type { Metadata } from "next";
import { saveCompanyOpportunityAction } from "@/app/actions/company";
import { PageHeader } from "@/components/dashboard/page-header";
import { OpportunityForm } from "@/components/forms/opportunity-form";
import { requireCompany } from "@/lib/auth";
import { getAllFields } from "@/lib/queries";

export const metadata: Metadata = { title: "Post a New Opportunity" };

export default async function NewOpportunityPage() {
  const { company } = await requireCompany();
  const fields = await getAllFields();
  return (
    <>
      <PageHeader
        title="Post a New Opportunity"
        description={company.verified ? "Your company is verified — your opportunity goes live immediately." : "New opportunities are reviewed by our team, usually within 24 hours."}
      />
      <OpportunityForm
        action={saveCompanyOpportunityAction}
        fields={fields}
        defaults={{ location: company.location?.split(",")[0] ?? "" }}
        submitLabel={company.verified ? "Publish Opportunity" : "Submit for Review"}
      />
    </>
  );
}
