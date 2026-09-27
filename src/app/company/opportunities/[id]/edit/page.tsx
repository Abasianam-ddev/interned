import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { Eye } from "lucide-react";
import { db } from "@/db";
import { opportunities } from "@/db/schema";
import { saveCompanyOpportunityAction } from "@/app/actions/company";
import { PageHeader } from "@/components/dashboard/page-header";
import { OpportunityForm } from "@/components/forms/opportunity-form";
import { OpportunityStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { requireCompany } from "@/lib/auth";
import { getAllFields } from "@/lib/queries";

export const metadata: Metadata = { title: "Edit Opportunity" };

export default async function EditOpportunityPage({ params }: PageProps<"/company/opportunities/[id]/edit">) {
  const { id } = await params;
  const { company } = await requireCompany();
  const [opp, fields] = await Promise.all([
    db.query.opportunities.findFirst({ where: and(eq(opportunities.id, id), eq(opportunities.companyId, company.id)) }),
    getAllFields(),
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
          <Button asChild variant="secondary">
            <Link href={`/opportunities/${opp.slug}`}>
              <Eye /> Preview
            </Link>
          </Button>
        }
      />
      {opp.status === "rejected" && opp.rejectionReason && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Not approved:</strong> {opp.rejectionReason} — update the listing and resubmit it for review.
        </div>
      )}
      <OpportunityForm
        action={saveCompanyOpportunityAction}
        fields={fields}
        defaults={opp}
        showDraft={opp.status === "draft"}
        submitLabel={opp.status === "draft" || opp.status === "rejected" ? (company.verified ? "Publish" : "Submit for Review") : "Save Changes"}
      />
    </>
  );
}
