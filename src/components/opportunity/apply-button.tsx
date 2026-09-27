"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, ExternalLink, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { trackExternalApplicationAction } from "@/app/actions/student";
import { cn } from "@/lib/utils";

export type ApplyState =
  | { kind: "guest" }
  | { kind: "not-student" }
  | { kind: "closed" }
  | { kind: "applied"; applicationId: string }
  | { kind: "draft" }
  | { kind: "open" };

export function ApplyButton({
  state,
  slug,
  opportunityId,
  method,
  externalUrl,
  applicationEmail,
  title,
  className,
}: {
  state: ApplyState;
  slug: string;
  opportunityId: string;
  method: "internal" | "external" | "email";
  externalUrl: string | null;
  applicationEmail: string | null;
  title: string;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, start] = React.useTransition();
  const base = cn("h-12 px-7 text-[15px]", className);

  if (state.kind === "closed")
    return (
      <Button disabled variant="secondary" className={base}>
        <Lock /> Applications closed
      </Button>
    );
  if (state.kind === "applied")
    return (
      <Button asChild variant="soft" className={base}>
        <Link href={`/dashboard/applications/${state.applicationId}`}>
          <CheckCircle2 /> Applied · View status
        </Link>
      </Button>
    );
  if (state.kind === "not-student")
    return (
      <Button disabled variant="secondary" className={base} title="Only student accounts can apply">
        Student accounts only
      </Button>
    );
  if (state.kind === "guest")
    return (
      <Button asChild className={base}>
        <Link href={`/login?next=${encodeURIComponent(`/opportunities/${slug}${method === "internal" ? "/apply" : ""}`)}`}>
          Apply Now <ArrowRight />
        </Link>
      </Button>
    );
  if (method === "internal")
    return (
      <Button asChild className={base}>
        <Link href={`/opportunities/${slug}/apply`}>
          {state.kind === "draft" ? "Continue Application" : "Apply Now"} <ArrowRight />
        </Link>
      </Button>
    );

  const href =
    method === "external"
      ? (externalUrl ?? "#")
      : `mailto:${applicationEmail}?subject=${encodeURIComponent(`Application: ${title}`)}`;
  return (
    <>
      <Button asChild className={base}>
        <a href={href} target={method === "external" ? "_blank" : undefined} rel="noreferrer" onClick={() => setTimeout(() => setOpen(true), 400)}>
          Apply Now {method === "external" ? <ExternalLink /> : <Mail />}
        </a>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          title="Did you complete your application?"
          description={
            method === "external"
              ? "This opportunity is handled on the company's website. Mark it as applied to track it in your dashboard."
              : `Send your CV and cover letter to ${applicationEmail}. Mark it as applied to track it in your dashboard.`
          }
        >
          <div className="flex justify-end gap-2.5">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Not yet
            </Button>
            <Button
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await trackExternalApplicationAction(opportunityId);
                  toast.success("Added to My Applications");
                  setOpen(false);
                  router.refresh();
                })
              }
            >
              Yes, track it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
