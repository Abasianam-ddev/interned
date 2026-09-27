import { SelectField, TextField } from "@/components/forms/fields";
import { OPPORTUNITY_STATUS } from "@/lib/constants";

export function OpportunityAdminFields({
  companies,
  defaults,
}: {
  companies: { id: string; name: string }[];
  defaults?: { companyId?: string; status?: string; verified?: boolean; featured?: boolean; rejectionReason?: string | null };
}) {
  return (
    <div className="space-y-5 rounded-xl border border-brand-200 bg-brand-50/60 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-800">Admin settings</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          name="companyId"
          label="Company"
          required
          placeholder="Select company"
          defaultValue={defaults?.companyId ?? ""}
          options={companies.map((c) => ({ value: c.id, label: c.name }))}
        />
        <SelectField
          name="status"
          label="Status"
          defaultValue={defaults?.status ?? "published"}
          options={Object.entries(OPPORTUNITY_STATUS).map(([value, v]) => ({ value, label: v.label }))}
        />
      </div>
      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="verified" defaultChecked={defaults?.verified ?? true} className="size-4" /> Verified badge
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={defaults?.featured} className="size-4" /> Featured on home page
        </label>
      </div>
      <TextField name="rejectionReason" label="Rejection reason (if rejected)" defaultValue={defaults?.rejectionReason ?? ""} />
    </div>
  );
}
