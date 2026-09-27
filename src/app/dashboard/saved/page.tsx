import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Bookmark } from "lucide-react";
import { db } from "@/db";
import { companies, fields, opportunities, savedOpportunities } from "@/db/schema";
import { OpportunityRow } from "@/components/opportunity/cards";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { cardColumns, getAppliedIds, type OpportunityCardData } from "@/lib/queries";
import { isDeadlinePassed } from "@/lib/utils";

export const metadata: Metadata = { title: "Saved Opportunities" };

export default async function SavedPage() {
  const user = await requireUser(["student"]);
  const [rows, applied] = await Promise.all([
    db
      .select({ ...cardColumns, status: opportunities.status })
      .from(savedOpportunities)
      .innerJoin(opportunities, eq(savedOpportunities.opportunityId, opportunities.id))
      .innerJoin(companies, eq(opportunities.companyId, companies.id))
      .leftJoin(fields, eq(opportunities.fieldId, fields.id))
      .where(eq(savedOpportunities.userId, user.id))
      .orderBy(desc(savedOpportunities.createdAt)),
    getAppliedIds(user.id),
  ]);
  return (
    <>
      <PageHeader title="Saved Opportunities" description={`You have ${rows.length} saved ${rows.length === 1 ? "opportunity" : "opportunities"}.`} />
      {rows.length ? (
        <div className="space-y-4">
          {rows.map((o) => (
            <div key={o.id} className="relative">
              {(o.status !== "published" || isDeadlinePassed(o.deadline)) && (
                <span className="absolute right-4 top-4 z-20 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  Closed
                </span>
              )}
              <OpportunityRow o={o as OpportunityCardData} saved loggedIn applied={applied.has(o.id)} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="No saved opportunities yet"
          description="Tap the bookmark icon on any opportunity to save it for later."
          action={
            <Button asChild>
              <Link href="/opportunities">Browse opportunities</Link>
            </Button>
          }
        />
      )}
    </>
  );
}
