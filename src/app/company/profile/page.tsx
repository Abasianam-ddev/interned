import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Eye } from "lucide-react";
import { updateCompanyProfileAction } from "@/app/actions/company";
import { PageHeader } from "@/components/dashboard/page-header";
import { CompanyProfileFields } from "@/components/forms/company-profile-fields";
import { ActionForm, SubmitButton } from "@/components/shared/action-form";
import { Button } from "@/components/ui/button";
import { requireCompany } from "@/lib/auth";

export const metadata: Metadata = { title: "Company Profile" };

export default async function CompanyProfilePage({ searchParams }: PageProps<"/company/profile">) {
  const { company } = await requireCompany();
  const { welcome } = await searchParams;
  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            Company Profile {company.verified && <BadgeCheck className="size-6 fill-brand-600 text-white" />}
          </span>
        }
        description="This is what students see on your public company page."
        actions={
          <Button asChild variant="secondary">
            <Link href={`/companies/${company.slug}`}>
              <Eye /> View public page
            </Link>
          </Button>
        }
      />
      {welcome && (
        <div className="mb-6 rounded-2xl bg-brand-900 p-6 text-white">
          <h2 className="text-lg font-bold">Welcome to Internly! 🎉</h2>
          <p className="mt-1 text-sm text-white/75">Complete your company profile, then post your first opportunity to start receiving applications.</p>
        </div>
      )}
      <ActionForm action={updateCompanyProfileAction} className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
        <CompanyProfileFields company={company} />
        <div className="mt-8 flex justify-end border-t border-line pt-6">
          <SubmitButton size="lg">Save Profile</SubmitButton>
        </div>
      </ActionForm>
    </>
  );
}
