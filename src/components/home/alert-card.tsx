"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ActionForm, FieldError, SubmitButton } from "@/components/shared/action-form";
import { createAlertAction } from "@/app/actions/student";
import { cn } from "@/lib/utils";

export function BellIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={cn("size-24", className)} aria-hidden>
      <g stroke="#087f5b" strokeWidth="2.5" strokeLinecap="round">
        <path d="M14 30l-6-4M12 48H4M16 64l-6 4M82 30l6-4M84 48h8M80 64l6 4M48 6v6" />
      </g>
      <circle cx="30" cy="20" r="2" fill="#13a06f" />
      <circle cx="70" cy="76" r="2" fill="#13a06f" />
      <path d="M48 16c-13 0-22 10-22 23v14l-6 10h56l-6-10V39c0-13-9-23-22-23z" fill="#087f5b" />
      <path d="M34 36c1-8 6-13 13-14" stroke="#9edcc3" strokeWidth="3" strokeLinecap="round" fill="none" />
      <rect x="18" y="62" width="60" height="7" rx="3.5" fill="#064e3b" />
      <circle cx="48" cy="76" r="6" fill="#064e3b" />
    </svg>
  );
}

export function AlertCard({ loggedIn, className }: { loggedIn: boolean; className?: string }) {
  return (
    <div className={cn("rounded-2xl bg-brand-100/70 p-6 ring-1 ring-brand-200/60", className)}>
      <div className="flex items-start gap-4">
        <BellIllustration className="-ml-2 size-24 shrink-0" />
        <div>
          <h3 className="text-xl font-bold leading-tight text-ink">
            Never Miss
            <br />
            an Opportunity
          </h3>
          <p className="mt-3 text-[13px] leading-relaxed text-ink/70">
            Get opportunities that match your interests. Set your preferences and we&apos;ll send you alerts.
          </p>
        </div>
      </div>
      {loggedIn ? (
        <Link
          href="/dashboard/alerts"
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-700 text-sm font-semibold text-white hover:bg-brand-800"
        >
          Get Opportunity Alerts <ArrowRight className="size-4" />
        </Link>
      ) : (
        <ActionForm action={createAlertAction} resetOnSuccess className="mt-5 space-y-2.5" showErrorBanner={false}>
          <input type="hidden" name="frequency" value="weekly" />
          <div>
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email address"
              aria-label="Email address"
              className="h-11 w-full rounded-lg border border-brand-200 bg-white px-3.5 text-sm focus:border-brand-500 focus:outline-none"
            />
            <FieldError name="email" />
          </div>
          <SubmitButton className="h-11 w-full bg-brand-700 hover:bg-brand-800">
            Get Opportunity Alerts <ArrowRight />
          </SubmitButton>
        </ActionForm>
      )}
    </div>
  );
}
