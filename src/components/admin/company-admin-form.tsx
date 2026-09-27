import type { Company } from "@/db/schema";
import { saveAdminCompanyAction } from "@/app/actions/admin";
import { CompanyProfileFields } from "@/components/forms/company-profile-fields";
import { SelectField, TextField } from "@/components/forms/fields";
import { ActionForm, SubmitButton } from "@/components/shared/action-form";

export function CompanyAdminForm({ company, ownerEmail }: { company?: Company; ownerEmail?: string | null }) {
  return (
    <ActionForm action={saveAdminCompanyAction} className="space-y-6">
      {company && <input type="hidden" name="id" value={company.id} />}
      <div className="space-y-5 rounded-2xl border border-brand-200 bg-brand-50/60 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-800">Admin settings</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="ownerEmail"
            type="email"
            label="Owner account email"
            defaultValue={ownerEmail ?? ""}
            hint="A company-role user who manages this company. Leave empty for none."
          />
          <SelectField
            name="status"
            label="Status"
            defaultValue={company?.status ?? "active"}
            options={[
              { value: "active", label: "Active" },
              { value: "pending", label: "Pending" },
              { value: "suspended", label: "Suspended" },
            ]}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="verified" defaultChecked={company?.verified} className="size-4" /> Verified company (auto-publishes its
          opportunities and shows the Verified badge)
        </label>
      </div>
      <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
        <CompanyProfileFields company={company} />
      </div>
      <div className="flex justify-end">
        <SubmitButton size="lg">{company ? "Save Changes" : "Create Company"}</SubmitButton>
      </div>
    </ActionForm>
  );
}
