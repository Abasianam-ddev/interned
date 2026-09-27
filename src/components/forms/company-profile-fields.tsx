import type { Company } from "@/db/schema";
import { ImageField, SelectField, TextAreaField, TextField } from "@/components/forms/fields";
import { Label } from "@/components/ui/input";
import { COMPANY_SIZES } from "@/lib/constants";

/** Company profile inputs shared by the company dashboard and the admin company editor. */
export function CompanyProfileFields({ company }: { company?: Partial<Company> }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <ImageField name="logo" label="Logo" shape="square" current={company?.logoUrl} />
        <ImageField name="cover" label="Cover image" shape="wide" current={company?.coverUrl} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="name" label="Company name" required defaultValue={company?.name} />
        <TextField name="tagline" label="Tagline" defaultValue={company?.tagline ?? ""} placeholder="e.g. Build • Innovate • Grow" />
        <TextField name="industry" label="Industry" defaultValue={company?.industry ?? ""} placeholder="e.g. Software Development" />
        <TextField name="location" label="Location" defaultValue={company?.location ?? ""} placeholder="e.g. Lagos, Nigeria" />
        <TextField name="website" label="Website" defaultValue={company?.website ?? ""} placeholder="https://" />
        <TextField name="email" type="email" label="Contact email" defaultValue={company?.email ?? ""} />
        <TextField name="phone" label="Phone" defaultValue={company?.phone ?? ""} />
        <SelectField name="size" label="Company size" placeholder="Select size" options={COMPANY_SIZES.map((s) => ({ value: s, label: `${s} employees` }))} defaultValue={company?.size ?? ""} />
        <TextField name="foundedYear" type="number" label="Year founded" defaultValue={company?.foundedYear ?? ""} min={1800} max={new Date().getFullYear()} />
        <div>
          <Label htmlFor="brandColor">Brand color (used when no logo)</Label>
          <input id="brandColor" type="color" name="brandColor" defaultValue={company?.brandColor ?? "#111827"} className="h-11 w-24 cursor-pointer rounded-lg border border-line bg-white p-1" />
        </div>
      </div>
      <TextAreaField name="description" label="About the company" rows={6} defaultValue={company?.description ?? ""} placeholder="What does your company do? What will interns experience?" />
      <div className="grid gap-5 sm:grid-cols-3">
        <TextField name="linkedin" label="LinkedIn" defaultValue={company?.socials?.linkedin ?? ""} placeholder="https://linkedin.com/company/…" />
        <TextField name="twitter" label="X (Twitter)" defaultValue={company?.socials?.twitter ?? ""} placeholder="https://x.com/…" />
        <TextField name="instagram" label="Instagram" defaultValue={company?.socials?.instagram ?? ""} placeholder="https://instagram.com/…" />
      </div>
    </div>
  );
}
