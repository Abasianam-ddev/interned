import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { Eye, Users } from "lucide-react";
import { db } from "@/db";
import { companies, opportunities } from "@/db/schema";
import { saveAdminOpportunityAction } from "@/app/actions/admin";
import { OpportunityAdminFields } from "@/components/admin/opportunity-admin-fields";
import { PageHeader } from "@/components/dashboard/page-header";
import { OpportunityForm } from "@/components/forms/opportunity-form";
import { OpportunityStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { getAllFields } from "@/lib/queries";

export const metadata: Metadata = { title: "Edit Opportunity" };

export default async function AdminEditOpportunityPage({ params }: PageProps<"/admin/opportunities/[id]">) {
  const { id } = await params;
  const [opp, fields, companyList] = await Promise.all([
    db.query.opportunities.findFirst({ where: eq(opportunities.id, id) }),
    getAllFields(),
    db.select({ id: companies.id, name: companies.name }).from(companies).orderBy(asc(companies.name)),
  ]);
  if (!opp) notFound();
  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            Edit Opportunity <OpportunityStatusBadge status={opp.status} />
          </span>
        }
        description={opp.title}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={`/admin/applications?opportunity=${opp.id}`}>
                <Users /> Applications
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={`/opportunities/${opp.slug}`}>
                <Eye /> View
              </Link>
            </Button>
          </>
        }
      />
      <OpportunityForm
        action={saveAdminOpportunityAction}
        fields={fields}
        defaults={opp}
        showDraft={false}
        submitLabel="Save Changes"
        adminSlot={<OpportunityAdminFields companies={companyList} defaults={opp} />}
      />
    </>
  );
}
