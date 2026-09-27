import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { resources } from "@/db/schema";
import { ResourceForm } from "@/components/admin/resource-form";
import { PageHeader } from "@/components/dashboard/page-header";

export const metadata: Metadata = { title: "Edit Resource" };

export default async function EditResourcePage({ params }: PageProps<"/admin/resources/[id]">) {
  const { id } = await params;
  const resource = await db.query.resources.findFirst({ where: eq(resources.id, id) });
  if (!resource) notFound();
  return (
    <>
      <PageHeader title="Edit Resource" description={resource.title} />
      <ResourceForm resource={resource} />
    </>
  );
}
