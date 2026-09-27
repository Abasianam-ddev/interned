import type { Metadata } from "next";
import { AccountForms } from "@/components/dashboard/account-settings";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireCompany } from "@/lib/auth";

export const metadata: Metadata = { title: "Settings" };

export default async function CompanySettingsPage() {
  const { user } = await requireCompany();
  return (
    <>
      <PageHeader title="Account Settings" description="Manage your login details." />
      <div className="space-y-6">
        <AccountForms user={user} />
      </div>
    </>
  );
}
