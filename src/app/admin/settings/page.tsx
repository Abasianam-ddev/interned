import type { Metadata } from "next";
import { saveSettingsAction } from "@/app/actions/admin";
import { AccountForms, SettingsSection } from "@/components/dashboard/account-settings";
import { PageHeader } from "@/components/dashboard/page-header";
import { ImageField, TextField } from "@/components/forms/fields";
import { ActionForm, SubmitButton } from "@/components/shared/action-form";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Site Settings" };

export default async function AdminSettingsPage() {
  const user = await requireUser(["admin"]);
  const s = await getSettings();
  return (
    <>
      <PageHeader title="Site Settings" description="Home page content, statistics, contact details and social links." />
      <div className="space-y-6">
        <ActionForm action={saveSettingsAction} className="space-y-6">
          <SettingsSection title="Home page hero" description="The first thing visitors see.">
            <div className="grid gap-5">
              <TextField name="heroBadge" label="Badge text" defaultValue={s.heroBadge} />
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField name="heroTitleLine1" label="Title line 1" defaultValue={s.heroTitleLine1} />
                <TextField name="heroTitleLine2" label="Title line 2 (green)" defaultValue={s.heroTitleLine2} />
              </div>
              <TextField name="heroSubtitle" label="Subtitle" defaultValue={s.heroSubtitle} />
              <TextField name="heroScript" label="Handwritten caption" defaultValue={s.heroScript} />
              <ImageField name="heroImageFile" label="Upload hero image" shape="wide" current={s.heroImage} />
              <TextField name="heroImage" label="…or hero image URL" defaultValue={s.heroImage} />
            </div>
          </SettingsSection>
          <SettingsSection title="Statistics" description="Shown on the home and about pages.">
            <div className="grid gap-5 sm:grid-cols-3">
              <TextField name="statOpportunities" label="Opportunities" defaultValue={s.statOpportunities} />
              <TextField name="statCompanies" label="Verified companies" defaultValue={s.statCompanies} />
              <TextField name="statStudents" label="Students & graduates" defaultValue={s.statStudents} />
            </div>
          </SettingsSection>
          <SettingsSection title="Contact details">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField name="contactEmail" label="Email" defaultValue={s.contactEmail} />
              <TextField name="contactPhone" label="Phone" defaultValue={s.contactPhone} />
              <TextField name="contactAddress" label="Location" defaultValue={s.contactAddress} />
              <TextField name="businessHours" label="Business hours" defaultValue={s.businessHours} />
            </div>
          </SettingsSection>
          <SettingsSection title="Social links">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField name="social_twitter" label="X (Twitter)" defaultValue={s.social.twitter} />
              <TextField name="social_instagram" label="Instagram" defaultValue={s.social.instagram} />
              <TextField name="social_linkedin" label="LinkedIn" defaultValue={s.social.linkedin} />
              <TextField name="social_facebook" label="Facebook" defaultValue={s.social.facebook} />
            </div>
          </SettingsSection>
          <SettingsSection title="Announcement bar" description="Optional banner shown at the top of every public page.">
            <TextField name="announcement" label="Announcement" defaultValue={s.announcement} placeholder="e.g. SIWES 2027 placements are now open!" />
          </SettingsSection>
          <div className="flex justify-end">
            <SubmitButton size="lg">Save Site Settings</SubmitButton>
          </div>
        </ActionForm>
        <AccountForms user={user} allowDelete={false} />
      </div>
    </>
  );
}
