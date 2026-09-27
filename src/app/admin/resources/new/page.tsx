import type { Metadata } from "next";
import { ResourceForm } from "@/components/admin/resource-form";
import { PageHeader } from "@/components/dashboard/page-header";

export const metadata: Metadata = { title: "New Resource" };

export default function NewResourcePage() {
  return (
    <>
      <PageHeader title="New Resource" description="Write a guide or article for students." />
      <ResourceForm />
    </>
  );
}
