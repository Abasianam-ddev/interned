import type { Metadata } from "next";
import Link from "next/link";
import { resetPasswordAction } from "@/app/actions/auth";
import { ActionForm, SubmitButton } from "@/components/shared/action-form";
import { PasswordInput } from "@/components/auth/password-input";
import { Label } from "@/components/ui/input";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  if (typeof token !== "string" || !token)
    return (
      <>
        <h1 className="text-2xl font-bold">Invalid link</h1>
        <p className="mt-2 text-sm text-muted">This password reset link is missing or invalid.</p>
        <Link href="/forgot-password" className="mt-6 inline-block font-semibold text-brand-700 hover:underline">
          Request a new link
        </Link>
      </>
    );
  return (
    <>
      <h1 className="text-3xl font-bold">Set a new password</h1>
      <p className="mt-2 text-sm text-muted">Choose a strong password you haven&apos;t used before.</p>
      <ActionForm action={resetPasswordAction} className="mt-8 space-y-5">
        <input type="hidden" name="token" value={token} />
        <div>
          <Label htmlFor="password">New password</Label>
          <PasswordInput name="password" autoComplete="new-password" required />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <PasswordInput name="confirm" autoComplete="new-password" required />
        </div>
        <SubmitButton size="lg" variant="dark" className="w-full">
          Reset password
        </SubmitButton>
      </ActionForm>
    </>
  );
}
