"use client";

import { PlusCircle } from "lucide-react";
import { saveFieldAction } from "@/app/actions/admin";
import { SelectField, TextAreaField, TextField } from "@/components/forms/fields";
import { ActionForm, SubmitButton } from "@/components/shared/action-form";
import { Button } from "@/components/ui/button";
import { FIELD_ICONS } from "@/lib/constants";
import { EditDialog } from "./inline-editor";

type F = { id: string; name: string; slug: string; icon: string; description: string | null; sortOrder: number };

export function FieldEditor({ field }: { field?: F }) {
  return (
    <EditDialog
      title={field ? "Edit field" : "New field"}
      trigger={
        field ? undefined : (
          <Button>
            <PlusCircle /> New Field
          </Button>
        )
      }
    >
      {(close) => (
        <ActionForm action={saveFieldAction} onSuccess={close} resetOnSuccess={!field} className="space-y-4">
          {field && <input type="hidden" name="id" value={field.id} />}
          <TextField name="name" label="Name" required defaultValue={field?.name} />
          <TextField name="slug" label="Slug" defaultValue={field?.slug} hint="Used in URLs. Leave empty to generate." />
          <div className="grid grid-cols-2 gap-4">
            <SelectField name="icon" label="Icon" defaultValue={field?.icon ?? "briefcase"} options={FIELD_ICONS.map((i) => ({ value: i, label: i }))} />
            <TextField name="sortOrder" type="number" label="Sort order" defaultValue={field?.sortOrder ?? 0} />
          </div>
          <TextAreaField name="description" label="Description" rows={3} defaultValue={field?.description ?? ""} />
          <SubmitButton className="w-full">Save</SubmitButton>
        </ActionForm>
      )}
    </EditDialog>
  );
}
