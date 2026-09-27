import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Eye, PlusCircle } from "lucide-react";
import { db } from "@/db";
import { companies, users } from "@/db/schema";
import { CompanyAdminForm } from "@/components/admin/company-admin-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Edit Company" };

export default async function AdminEditCompanyPage({ params }: PageProps<"/admin/companies/[id]">) {
  const { id } = await params;
  const company = await db.query.companies.findFirst({ where: eq(companies.id, id) });
  if (!company) notFound();
  const owner = company.ownerId ? await db.query.users.findFirst({ where: eq(users.id, company.ownerId) }) : null;
  return (
    <>
      <PageHeader
        title="Edit Company"
        description={company.name}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={`/admin/opportunities/new?company=${company.id}`}>
                <PlusCircle /> Add opportunity
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={`/companies/${company.slug}`}>
                <Eye /> Public page
              </Link>
            </Button>
          </>
        }
      />
      <CompanyAdminForm company={company} ownerEmail={owner?.email} />
    </>
  );
}
