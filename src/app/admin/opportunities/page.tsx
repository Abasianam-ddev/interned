import type { Metadata } from "next";
import Link from "next/link";
import { and, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { BadgeCheck, Briefcase, PlusCircle, Star } from "lucide-react";
import { db } from "@/db";
import { companies, opportunities, type OpportunityStatus } from "@/db/schema";
import { adminDeleteOpportunityAction, moderateOpportunityAction, toggleOpportunityFlagAction } from "@/app/actions/admin";
import { ListToolbar, TableCard, Td, Th } from "@/components/admin/list-toolbar";
import { RowMenu, type RowMenuItem } from "@/components/admin/row-menu";
import { PageHeader } from "@/components/dashboard/page-header";
import { CompanyLogo } from "@/components/shared/company-logo";
import { EmptyState } from "@/components/shared/empty-state";
import { FlashToast } from "@/components/shared/flash-toast";
import { Pagination } from "@/components/shared/pagination";
import { OpportunityStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { OPPORTUNITY_STATUS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Manage Opportunities" };
const PER_PAGE = 20;

export default async function AdminOpportunitiesPage({ searchParams }: PageProps<"/admin/opportunities">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" && sp.status in OPPORTUNITY_STATUS ? (sp.status as OpportunityStatus) : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const conds: SQL[] = [];
  if (status) conds.push(eq(opportunities.status, status));
  if (q) conds.push(or(ilike(opportunities.title, `%${q}%`), ilike(companies.name, `%${q}%`))!);
  const where = conds.length ? and(...conds) : undefined;

  const [rows, [{ total }], counts] = await Promise.all([
    db
      .select({
        id: opportunities.id,
        slug: opportunities.slug,
        title: opportunities.title,
        status: opportunities.status,
        verified: opportunities.verified,
        featured: opportunities.featured,
        deadline: opportunities.deadline,
        createdAt: opportunities.createdAt,
        views: opportunities.views,
        companyName: companies.name,
        companyLogo: companies.logoUrl,
        companyColor: companies.brandColor,
        applicants: sql<number>`(select count(*) from applications a where a.opportunity_id = "opportunities"."id" and a.status <> 'draft')`.mapWith(Number),
      })
      .from(opportunities)
      .innerJoin(companies, eq(opportunities.companyId, companies.id))
      .where(where)
      .orderBy(desc(opportunities.createdAt))
      .limit(PER_PAGE)
      .offset((page - 1) * PER_PAGE),
    db.select({ total: count() }).from(opportunities).innerJoin(companies, eq(opportunities.companyId, companies.id)).where(where),
    db.select({ status: opportunities.status, n: count() }).from(opportunities).groupBy(opportunities.status),
  ]);
  const countOf = (s: string) => counts.find((c) => c.status === s)?.n ?? 0;

  return (
    <>
      <FlashToast />
      <PageHeader
        title="Opportunities"
        description="Review, publish and manage every listing on the platform."
        actions={
          <Button asChild>
            <Link href="/admin/opportunities/new">
              <PlusCircle /> New Opportunity
            </Link>
          </Button>
        }
      />
      <ListToolbar
        basePath="/admin/opportunities"
        params={sp}
        placeholder="Search by title or company"
        tabs={[
          { value: "", label: "All", count: counts.reduce((a, c) => a + c.n, 0) },
          ...Object.entries(OPPORTUNITY_STATUS).map(([value, v]) => ({ value, label: v.label, count: countOf(value) })),
        ]}
      />
      {rows.length ? (
        <TableCard>
          <thead className="border-b border-line">
            <tr>
              <Th>Opportunity</Th>
              <Th>Status</Th>
              <Th>Flags</Th>
              <Th>Applicants</Th>
              <Th>Deadline</Th>
              <Th />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((o) => {
              const items: RowMenuItem[] = [
                { type: "link", label: "View", href: `/opportunities/${o.slug}` },
                { type: "link", label: "Edit", href: `/admin/opportunities/${o.id}` },
                { type: "link", label: "Applications", href: `/admin/applications?opportunity=${o.id}` },
                { type: "separator" },
              ];
              if (o.status === "pending" || o.status === "rejected")
                items.push({ type: "action", label: "Approve & publish", action: moderateOpportunityAction.bind(null, o.id, "approve"), success: "Published" });
              if (o.status === "pending")
                items.push({
                  type: "action",
                  label: "Reject…",
                  prompt: "Reason for rejection (shared with the company):",
                  action: moderateOpportunityAction.bind(null, o.id, "reject"),
                  success: "Rejected",
                });
              if (o.status === "closed" || o.status === "draft")
                items.push({ type: "action", label: "Publish", action: moderateOpportunityAction.bind(null, o.id, "publish"), success: "Published" });
              if (o.status === "published") items.push({ type: "action", label: "Close", action: moderateOpportunityAction.bind(null, o.id, "close"), success: "Closed" });
              items.push(
                { type: "action", label: o.verified ? "Remove verified badge" : "Mark as verified", action: toggleOpportunityFlagAction.bind(null, o.id, "verified", !o.verified), success: "Updated" },
                { type: "action", label: o.featured ? "Unfeature" : "Feature on home page", action: toggleOpportunityFlagAction.bind(null, o.id, "featured", !o.featured), success: "Updated" },
                { type: "separator" },
                { type: "action", label: "Delete", danger: true, confirm: "Delete this opportunity and all its applications?", action: adminDeleteOpportunityAction.bind(null, o.id), success: "Deleted" },
              );
              return (
                <tr key={o.id} className="hover:bg-canvas/60">
                  <Td>
                    <div className="flex items-center gap-3">
                      <CompanyLogo name={o.companyName} logoUrl={o.companyLogo} color={o.companyColor} size="sm" />
                      <div className="min-w-0">
                        <Link href={`/admin/opportunities/${o.id}`} className="block truncate font-semibold hover:text-brand-700">
                          {o.title}
                        </Link>
                        <p className="text-xs text-muted">
                          {o.companyName} · {formatDate(o.createdAt)} · {o.views} views
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <OpportunityStatusBadge status={o.status} />
                  </Td>
                  <Td>
                    <div className="flex gap-1.5">
                      {o.verified && <BadgeCheck className="size-4 fill-brand-600 text-white" aria-label="Verified" />}
                      {o.featured && <Star className="size-4 fill-amber-400 text-amber-400" aria-label="Featured" />}
                    </div>
                  </Td>
                  <Td>{o.applicants}</Td>
                  <Td className="whitespace-nowrap text-ink/75">{formatDate(o.deadline)}</Td>
                  <Td className="text-right">
                    <RowMenu items={items} />
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableCard>
      ) : (
        <EmptyState icon={Briefcase} title="No opportunities found" />
      )}
      <Pagination page={page} totalPages={Math.ceil(total / PER_PAGE)} basePath="/admin/opportunities" params={sp} />
    </>
  );
}
