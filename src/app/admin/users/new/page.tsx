import type { Metadata } from "next";
import { UserForm } from "@/components/admin/user-form";
import { PageHeader } from "@/components/dashboard/page-header";

export const metadata: Metadata = { title: "New User" };

export default function AdminNewUserPage() {
  return (
    <>
      <PageHeader title="New User" description="Company users can then be assigned as owners of a company." />
      <div className="max-w-3xl">
        <UserForm />
      </div>
    </>
  );
}
