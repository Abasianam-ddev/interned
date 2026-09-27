import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { studentProfiles } from "@/db/schema";
import { updatePreferencesAction } from "@/app/actions/student";
import { AccountForms, SettingsSection } from "@/components/dashboard/account-settings";
import { PageHeader } from "@/components/dashboard/page-header";
import { ActionForm, SubmitButton } from "@/components/shared/action-form";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Account Settings" };

function Toggle({ name, label, description, defaultChecked }: { name: string; label: string; description: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-6 py-4">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted">{description}</span>
      </span>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500" />
        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export default async function StudentSettingsPage() {
  const user = await requireUser(["student"]);
  const profile = await db.query.studentProfiles.findFirst({ where: eq(studentProfiles.userId, user.id) });
  const prefs = profile?.notificationPrefs ?? { emailAlerts: true, applicationUpdates: true, newsletter: false };
  return (
    <>
      <PageHeader title="Account Settings" description="Manage your account, notifications and privacy." />
      <div className="space-y-6">
        <AccountForms user={user} />
        <SettingsSection title="Notifications & privacy" description="Choose what we email you about and who can see your profile.">
          <ActionForm action={updatePreferencesAction} className="max-w-xl">
            <div className="divide-y divide-line">
              <Toggle name="emailAlerts" label="Opportunity alerts" description="Emails for new opportunities that match your alerts." defaultChecked={prefs.emailAlerts} />
              <Toggle name="applicationUpdates" label="Application updates" description="Emails when a company updates your application status." defaultChecked={prefs.applicationUpdates} />
              <Toggle name="newsletter" label="Career tips newsletter" description="Occasional resources and tips from Internly." defaultChecked={prefs.newsletter} />
              <Toggle name="profileVisible" label="Visible to companies" description="Allow companies you apply to see your full profile." defaultChecked={profile?.profileVisible ?? true} />
            </div>
            <SubmitButton className="mt-4">Save Preferences</SubmitButton>
          </ActionForm>
        </SettingsSection>
      </div>
    </>
  );
}
