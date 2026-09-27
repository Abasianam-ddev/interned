import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { forgotPasswordAction } from "@/app/actions/auth";
import { ActionForm, SubmitButton } from "@/components/shared/action-form";
import { TextField } from "@/components/forms/fields";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-3xl font-bold">Forgot your password?</h1>
      <p className="mt-2 text-sm text-muted">Enter your email and we&apos;ll send you a link to reset it.</p>
      <ActionForm action={forgotPasswordAction} className="mt-8 space-y-5" resetOnSuccess>
        <TextField name="email" type="email" label="Email address" placeholder="you@example.com" required />
        <SubmitButton size="lg" variant="dark" className="w-full">
          Send reset link
        </SubmitButton>
      </ActionForm>
      <Link href="/login" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline">
        <ArrowLeft className="size-4" /> Back to log in
      </Link>
    </>
  );
}
