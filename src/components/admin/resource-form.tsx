import type { Resource } from "@/db/schema";
import { saveResourceAction } from "@/app/actions/admin";
import { ImageField, SelectField, TextAreaField, TextField } from "@/components/forms/fields";
import { ActionForm, SubmitButton } from "@/components/shared/action-form";
import { RESOURCE_CATEGORIES } from "@/lib/constants";

export function ResourceForm({ resource }: { resource?: Resource }) {
  return (
    <ActionForm action={saveResourceAction} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      {resource && <input type="hidden" name="id" value={resource.id} />}
      <div className="space-y-5 rounded-2xl border border-line bg-white p-6 shadow-card">
        <TextField name="title" label="Title" required defaultValue={resource?.title} />
        <TextAreaField name="excerpt" label="Excerpt" rows={2} defaultValue={resource?.excerpt ?? ""} hint="Shown on listing cards." />
        <TextAreaField
          name="content"
          label="Content (Markdown)"
          required
          rows={22}
          className="font-mono"
          defaultValue={resource?.content}
          hint="Use ## for headings, **bold**, - for bullet lists, > for quotes and [text](https://link) for links."
        />
      </div>
      <aside className="space-y-5 rounded-2xl border border-line bg-white p-6 shadow-card xl:self-start">
        <SelectField name="category" label="Category" required defaultValue={resource?.category ?? ""} placeholder="Select category" options={RESOURCE_CATEGORIES} />
        <TextField name="authorName" label="Author" defaultValue={resource?.authorName ?? "Internly Team"} />
        <TextField name="readMinutes" type="number" min={1} label="Read time (minutes)" defaultValue={resource?.readMinutes ?? ""} hint="Leave empty to calculate automatically." />
        <ImageField name="cover" label="Cover image" shape="wide" current={resource?.coverUrl} />
        <TextField name="coverUrl" label="…or cover image URL" defaultValue={resource?.coverUrl ?? ""} placeholder="https://" />
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="published" defaultChecked={resource?.published ?? true} className="size-4" /> Published
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="featured" defaultChecked={resource?.featured} className="size-4" /> Featured
          </label>
        </div>
        <SubmitButton className="w-full">{resource ? "Save Changes" : "Publish Resource"}</SubmitButton>
      </aside>
    </ActionForm>
  );
}
