import type { Metadata } from "next";
import { CompanyAdminForm } from "@/components/admin/company-admin-form";
import { PageHeader } from "@/components/dashboard/page-header";

export const metadata: Metadata = { title: "New Company" };

export default function AdminNewCompanyPage() {
  return (
    <>
      <PageHeader title="New Company" description="Add a company to the directory." />
      <CompanyAdminForm />
    </>
  );
}
