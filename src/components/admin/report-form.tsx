import { updateReportAction } from "@/app/actions/admin";
import { SelectField, TextField } from "@/components/forms/fields";
import { ActionForm, SubmitButton } from "@/components/shared/action-form";

export function ReportForm({ id, status, adminNote }: { id: string; status: string; adminNote: string | null }) {
  return (
    <ActionForm action={updateReportAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <input type="hidden" name="id" value={id} />
      <SelectField
        name="status"
        label="Status"
        defaultValue={status}
        className="sm:w-40"
        options={[
          { value: "open", label: "Open" },
          { value: "reviewing", label: "Reviewing" },
          { value: "resolved", label: "Resolved" },
          { value: "dismissed", label: "Dismissed" },
        ]}
      />
      <TextField name="adminNote" label="Internal note" defaultValue={adminNote ?? ""} className="flex-1" />
      <SubmitButton variant="secondary">Save</SubmitButton>
    </ActionForm>
  );
}
