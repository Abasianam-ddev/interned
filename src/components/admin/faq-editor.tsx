"use client";

import { PlusCircle } from "lucide-react";
import { saveFaqAction } from "@/app/actions/admin";
import { TextAreaField, TextField } from "@/components/forms/fields";
import { ActionForm, SubmitButton } from "@/components/shared/action-form";
import { Button } from "@/components/ui/button";
import { EditDialog } from "./inline-editor";

type F = { id: string; question: string; answer: string; category: string; sortOrder: number; published: boolean };

export function FaqEditor({ faq }: { faq?: F }) {
  return (
    <EditDialog
      title={faq ? "Edit FAQ" : "New FAQ"}
      trigger={
        faq ? undefined : (
          <Button>
            <PlusCircle /> New FAQ
          </Button>
        )
      }
    >
      {(close) => (
        <ActionForm action={saveFaqAction} onSuccess={close} resetOnSuccess={!faq} className="space-y-4">
          {faq && <input type="hidden" name="id" value={faq.id} />}
          <TextField name="question" label="Question" required defaultValue={faq?.question} />
          <TextAreaField name="answer" label="Answer (Markdown supported)" required rows={5} defaultValue={faq?.answer} />
          <div className="grid grid-cols-2 gap-4">
            <TextField name="category" label="Category" defaultValue={faq?.category ?? "General"} list="faq-categories" />
            <datalist id="faq-categories">
              {["General", "Students", "Companies", "Safety"].map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <TextField name="sortOrder" type="number" label="Sort order" defaultValue={faq?.sortOrder ?? 0} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked={faq?.published ?? true} className="size-4" /> Published
          </label>
          <SubmitButton className="w-full">Save</SubmitButton>
        </ActionForm>
      )}
    </EditDialog>
  );
}
