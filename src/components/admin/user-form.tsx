import type { User } from "@/db/schema";
import { saveUserAction } from "@/app/actions/admin";
import { SelectField, TextField } from "@/components/forms/fields";
import { ActionForm, SubmitButton } from "@/components/shared/action-form";

export function UserForm({ user }: { user?: Omit<User, "passwordHash"> }) {
  return (
    <ActionForm action={saveUserAction} className="space-y-5 rounded-2xl border border-line bg-white p-6 shadow-card">
      {user && <input type="hidden" name="id" value={user.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="name" label="Full name" required defaultValue={user?.name} />
        <TextField name="email" type="email" label="Email" required defaultValue={user?.email} />
        <TextField name="phone" label="Phone" defaultValue={user?.phone ?? ""} />
        <SelectField
          name="role"
          label="Role"
          defaultValue={user?.role ?? "student"}
          options={[
            { value: "student", label: "Student" },
            { value: "company", label: "Company" },
            { value: "admin", label: "Admin" },
          ]}
        />
        <SelectField
          name="status"
          label="Status"
          defaultValue={user?.status ?? "active"}
          options={[
            { value: "active", label: "Active" },
            { value: "suspended", label: "Suspended" },
          ]}
        />
        <TextField
          name="password"
          type="password"
          label={user ? "Set new password" : "Password"}
          required={!user}
          autoComplete="new-password"
          hint={user ? "Leave empty to keep the current password." : "At least 8 characters."}
        />
      </div>
      <SubmitButton>{user ? "Save Changes" : "Create User"}</SubmitButton>
    </ActionForm>
  );
}
