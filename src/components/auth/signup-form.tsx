"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, GraduationCap } from "lucide-react";
import { signupAction } from "@/app/actions/auth";
import { ActionForm, FieldError, SubmitButton } from "@/components/shared/action-form";
import { TextField } from "@/components/forms/fields";
import { PasswordInput } from "./password-input";
import { Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SignupForm({ initialRole, next }: { initialRole: "student" | "company"; next: string }) {
  const [role, setRole] = React.useState(initialRole);
  return (
    <ActionForm action={signupAction} className="mt-8 space-y-5">
      <input type="hidden" name="role" value={role} />
      <input type="hidden" name="next" value={next} />
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account type">
        {(
          [
            { value: "student", label: "I'm a student", sub: "Find internships", icon: GraduationCap },
            { value: "company", label: "I'm hiring", sub: "Post opportunities", icon: Building2 },
          ] as const
        ).map(({ value, label, sub, icon: Icon }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={role === value}
            onClick={() => setRole(value)}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3.5 text-left transition",
              role === value ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600" : "border-line hover:border-brand-300",
            )}
          >
            <span className={cn("flex size-9 items-center justify-center rounded-lg", role === value ? "bg-brand-600 text-white" : "bg-canvas text-ink/70")}>
              <Icon className="size-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold">{label}</span>
              <span className="block text-xs text-muted">{sub}</span>
            </span>
          </button>
        ))}
      </div>
      <TextField name="name" label="Full name" placeholder="John Doe" autoComplete="name" required />
      {role === "company" && (
        <TextField name="companyName" label="Company / organization name" placeholder="e.g. XYZ Technologies" required />
      )}
      <TextField
        name="email"
        type="email"
        label={role === "company" ? "Work email" : "Email address"}
        placeholder="you@example.com"
        autoComplete="email"
        required
      />
      <div>
        <Label htmlFor="password">Password</Label>
        <PasswordInput name="password" placeholder="At least 8 characters" autoComplete="new-password" required />
        <p className="mt-1.5 text-xs text-muted">Use 8+ characters with a mix of letters and numbers.</p>
      </div>
      <div>
        <label className="flex items-start gap-2.5 text-sm text-ink/80">
          <input type="checkbox" name="terms" className="mt-0.5 size-4" />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="font-medium text-brand-700 hover:underline" target="_blank">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-brand-700 hover:underline" target="_blank">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        <FieldError name="terms" />
      </div>
      <SubmitButton size="lg" variant="dark" className="w-full" pendingText="Creating account…">
        Create account
      </SubmitButton>
    </ActionForm>
  );
}
