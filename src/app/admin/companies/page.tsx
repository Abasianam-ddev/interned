import type { Metadata } from "next";
import Link from "next/link";
import { and, count, desc, eq, ilike, sql, type SQL } from "drizzle-orm";
import { BadgeCheck, Building2, PlusCircle } from "lucide-react";
import { db } from "@/db";
import { companies, users } from "@/db/schema";
import { deleteCompanyAction, setCompanyStatusAction, setCompanyVerifiedAction } from "@/app/actions/admin";
import { ListToolbar, TableCard, Td, Th } from "@/components/admin/list-toolbar";
import { RowMenu } from "@/components/admin/row-menu";
import { PageHeader } from "@/components/dashboard/page-header";
import { CompanyLogo } from "@/components/shared/company-logo";
import { EmptyState } from "@/components/shared/empty-state";
import { FlashToast } from "@/components/shared/flash-toast";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Manage Companies" };
const PER_PAGE = 20;

export default async function AdminCompaniesPage({ searchParams }: PageProps<"/admin/companies">) {
  const sp = await searchParams;
  const filter = typeof sp.filter === "string" ? sp.filter : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const conds: SQL[] = [];
  if (q) conds.push(ilike(companies.name, `%${q}%`));
  if (filter === "verified") conds.push(eq(companies.verified, true));
  if (filter === "unverified") conds.push(eq(companies.verified, false));
  if (filter === "suspended") conds.push(eq(companies.status, "suspended"));
  const where = conds.length ? and(...conds) : undefined;
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        c: companies,
        ownerEmail: users.email,
        opps: sql<number>`(select count(*) from opportunities o where o.company_id = "companies"."id")`.mapWith(Number),
      })
      .from(companies)
      .leftJoin(users, eq(companies.ownerId, users.id))
      .where(where)
      .orderBy(desc(companies.createdAt))
      .limit(PER_PAGE)
      .offset((page - 1) * PER_PAGE),
    db.select({ total: count() }).from(companies).where(where),
  ]);
  return (
    <>
      <FlashToast />
      <PageHeader
        title="Companies"
        description="Verify, edit and moderate companies."
        actions={
          <Button asChild>
            <Link href="/admin/companies/new">
              <PlusCircle /> New Company
            </Link>
          </Button>
        }
      />
      <ListToolbar
        basePath="/admin/companies"
        params={sp}
        tabKey="filter"
        placeholder="Search companies"
        tabs={[
          { value: "", label: "All" },
          { value: "verified", label: "Verified" },
          { value: "unverified", label: "Unverified" },
          { value: "suspended", label: "Suspended" },
        ]}
      />
      {rows.length ? (
        <TableCard>
          <thead className="border-b border-line">
            <tr>
              <Th>Company</Th>
              <Th>Owner</Th>
              <Th>Opportunities</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
              <Th />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(({ c, ownerEmail, opps }) => (
              <tr key={c.id} className="hover:bg-canvas/60">
                <Td>
                  <div className="flex items-center gap-3">
                    <CompanyLogo name={c.name} logoUrl={c.logoUrl} color={c.brandColor} size="sm" rounded="xl" />
                    <div className="min-w-0">
                      <Link href={`/admin/companies/${c.id}`} className="flex items-center gap-1 font-semibold hover:text-brand-700">
                        {c.name} {c.verified && <BadgeCheck className="size-4 fill-brand-600 text-white" />}
                      </Link>
                      <p className="text-xs text-muted">{[c.industry, c.location].filter(Boolean).join(" · ")}</p>
                    </div>
                  </div>
                </Td>
                <Td className="text-ink/75">{ownerEmail ?? <span className="text-muted">—</span>}</Td>
                <Td>{opps}</Td>
                <Td>
                  <Badge tone={c.status === "active" ? "green" : c.status === "suspended" ? "red" : "amber"} size="md" className="capitalize">
                    {c.status}
                  </Badge>
                </Td>
                <Td className="whitespace-nowrap text-ink/75">{formatDate(c.createdAt)}</Td>
                <Td className="text-right">
                  <RowMenu
                    items={[
                      { type: "link", label: "Public page", href: `/companies/${c.slug}` },
                      { type: "link", label: "Edit", href: `/admin/companies/${c.id}` },
                      { type: "link", label: "Add opportunity", href: `/admin/opportunities/new?company=${c.id}` },
                      { type: "separator" },
                      {
                        type: "action",
                        label: c.verified ? "Remove verification" : "Verify company",
                        action: setCompanyVerifiedAction.bind(null, c.id, !c.verified),
                        success: c.verified ? "Verification removed" : "Company verified",
                      },
                      {
                        type: "action",
                        label: c.status === "suspended" ? "Reactivate" : "Suspend",
                        confirm: c.status === "suspended" ? undefined : "Suspending hides the company and all its opportunities. Continue?",
                        action: setCompanyStatusAction.bind(null, c.id, c.status === "suspended" ? "active" : "suspended"),
                        success: "Updated",
                      },
                      { type: "separator" },
                      {
                        type: "action",
                        label: "Delete",
                        danger: true,
                        confirm: "Delete this company, its opportunities and applications? This cannot be undone.",
                        action: deleteCompanyAction.bind(null, c.id),
                        success: "Company deleted",
                      },
                    ]}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      ) : (
        <EmptyState icon={Building2} title="No companies found" />
      )}
      <Pagination page={page} totalPages={Math.ceil(total / PER_PAGE)} basePath="/admin/companies" params={sp} />
    </>
  );
}
