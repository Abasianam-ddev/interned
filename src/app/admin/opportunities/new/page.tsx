import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { saveAdminOpportunityAction } from "@/app/actions/admin";
import { OpportunityAdminFields } from "@/components/admin/opportunity-admin-fields";
import { PageHeader } from "@/components/dashboard/page-header";
import { OpportunityForm } from "@/components/forms/opportunity-form";
import { getAllFields } from "@/lib/queries";

export const metadata: Metadata = { title: "New Opportunity" };

export default async function AdminNewOpportunityPage({ searchParams }: PageProps<"/admin/opportunities/new">) {
  const { company } = await searchParams;
  const [fields, companyList] = await Promise.all([
    getAllFields(),
    db.select({ id: companies.id, name: companies.name }).from(companies).orderBy(asc(companies.name)),
  ]);
  return (
    <>
      <PageHeader title="New Opportunity" description="Create a listing on behalf of any company." />
      <OpportunityForm
        action={saveAdminOpportunityAction}
        fields={fields}
        showDraft={false}
        submitLabel="Save Opportunity"
        adminSlot={<OpportunityAdminFields companies={companyList} defaults={{ companyId: typeof company === "string" ? company : undefined }} />}
      />
    </>
  );
}
