import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { savePageAction } from "@/app/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { TextAreaField, TextField } from "@/components/forms/fields";
import { ActionForm, SubmitButton } from "@/components/shared/action-form";
import { Button } from "@/components/ui/button";
import { getPage } from "@/lib/pages";
import { EDITABLE_PAGES } from "@/lib/constants";

export const metadata: Metadata = { title: "Edit Page" };

export default async function AdminEditPage({ params }: PageProps<"/admin/pages/[slug]">) {
  const { slug } = await params;
  const meta = EDITABLE_PAGES.find((p) => p.slug === slug);
  if (!meta) notFound();
  const page = await getPage(slug);
  return (
    <>
      <PageHeader
        title={`Edit: ${meta.title}`}
        actions={
          <Button asChild variant="secondary">
            <Link href={meta.path}>
              <Eye /> View page
            </Link>
          </Button>
        }
      />
      <ActionForm action={savePageAction} className="space-y-5 rounded-2xl border border-line bg-white p-6 shadow-card">
        <input type="hidden" name="slug" value={slug} />
        <TextField name="title" label="Title" required defaultValue={page?.title ?? meta.title} />
        <TextField name="summary" label="Summary / intro" defaultValue={page?.summary ?? ""} />
        <TextAreaField name="content" label="Content (Markdown)" rows={24} className="font-mono" required defaultValue={page?.content ?? ""} />
        <SubmitButton>Save Page</SubmitButton>
      </ActionForm>
    </>
  );
}
