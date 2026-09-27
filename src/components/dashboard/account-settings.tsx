import { changePasswordAction } from "@/app/actions/auth";
import { deleteAccountAction, updateAccountAction } from "@/app/actions/student";
import { TextField } from "@/components/forms/fields";
import { PasswordInput } from "@/components/auth/password-input";
import { ActionForm, SubmitButton } from "@/components/shared/action-form";
import { Label } from "@/components/ui/input";
import type { CurrentUser } from "@/lib/auth";

export function SettingsSection({ title, description, children, danger }: { title: string; description?: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <section className={`grid gap-6 rounded-2xl border bg-white p-6 shadow-card lg:grid-cols-[260px_1fr] ${danger ? "border-red-200" : "border-line"}`}>
      <div>
        <h2 className={`font-bold ${danger ? "text-red-600" : ""}`}>{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}

export function AccountForms({ user, allowDelete = true }: { user: CurrentUser; allowDelete?: boolean }) {
  return (
    <>
      <SettingsSection title="Account" description="Your name, email and phone number.">
        <ActionForm action={updateAccountAction} className="grid max-w-xl gap-5">
          <TextField name="name" label="Full name" defaultValue={user.name} required />
          <TextField name="email" type="email" label="Email address" defaultValue={user.email} required />
          <TextField name="phone" type="tel" label="Phone number" defaultValue={user.phone ?? ""} />
          <div>
            <SubmitButton>Save Changes</SubmitButton>
          </div>
        </ActionForm>
      </SettingsSection>
      <SettingsSection title="Change password" description="Use at least 8 characters with letters and numbers.">
        <ActionForm action={changePasswordAction} resetOnSuccess className="grid max-w-xl gap-5">
          <div>
            <Label htmlFor="currentPassword">Current password</Label>
            <PasswordInput name="currentPassword" autoComplete="current-password" required />
          </div>
          <div>
            <Label htmlFor="newPassword">New password</Label>
            <PasswordInput name="newPassword" autoComplete="new-password" required />
          </div>
          <div>
            <SubmitButton>Update Password</SubmitButton>
          </div>
        </ActionForm>
      </SettingsSection>
      {allowDelete && (
        <SettingsSection title="Delete account" description="Permanently delete your account and all associated data. This cannot be undone." danger>
          <ActionForm action={deleteAccountAction} className="grid max-w-xl gap-4" confirm="This will permanently delete your account. Continue?">
            <TextField name="confirm" label='Type "DELETE" to confirm' autoComplete="off" />
            <div>
              <SubmitButton variant="danger">Delete my account</SubmitButton>
            </div>
          </ActionForm>
        </SettingsSection>
      )}
    </>
  );
}
