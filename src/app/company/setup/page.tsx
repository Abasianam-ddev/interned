import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createCompanyAction } from "@/app/actions/company";
import { TextField } from "@/components/forms/fields";
import { ActionForm, SubmitButton } from "@/components/shared/action-form";
import { Logo } from "@/components/shared/logo";
import { getCompanyForUser, requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Set up your company" };

export default async function CompanySetupPage() {
  const user = await requireUser(["company"]);
  if (await getCompanyForUser(user.id)) redirect("/company");
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Logo />
      <div className="mt-8 rounded-2xl border border-line bg-white p-8 shadow-card">
        <h1 className="text-2xl font-bold">Set up your company</h1>
        <p className="mt-1 text-sm text-muted">Tell students who you are. You can add more details later.</p>
        <ActionForm action={createCompanyAction} className="mt-6 space-y-5">
          <TextField name="name" label="Company name" required />
          <TextField name="industry" label="Industry" placeholder="e.g. Software Development" />
          <TextField name="location" label="Location" placeholder="e.g. Lagos, Nigeria" />
          <TextField name="website" label="Website" placeholder="https://" />
          <SubmitButton className="w-full" size="lg">
            Continue
          </SubmitButton>
        </ActionForm>
      </div>
    </div>
  );
}
