import type { Metadata } from "next";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { ActionForm, SubmitButton } from "@/components/shared/action-form";
import { TextField } from "@/components/forms/fields";
import { PasswordInput } from "@/components/auth/password-input";
import { Label } from "@/components/ui/input";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "";
  return (
    <>
      <h1 className="text-3xl font-bold">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">Log in to continue your internship journey.</p>
      {sp.reset && (
        <p className="mt-6 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">Your password has been reset. Please log in.</p>
      )}
      <ActionForm action={loginAction} className="mt-8 space-y-5">
        <input type="hidden" name="next" value={next} />
        <TextField name="email" type="email" label="Email address" placeholder="you@example.com" autoComplete="email" required />
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="mb-1.5 text-xs font-medium text-brand-700 hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput name="password" placeholder="Enter your password" autoComplete="current-password" required />
        </div>
        <SubmitButton size="lg" variant="dark" className="w-full" pendingText="Logging in…">
          Log in
        </SubmitButton>
      </ActionForm>
      <p className="mt-8 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-semibold text-brand-700 hover:underline">
          Sign up
        </Link>
      </p>
    </>
  );
}
