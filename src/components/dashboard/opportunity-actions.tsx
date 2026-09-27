"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Eye, Lock, MoreHorizontal, Pencil, RotateCcw, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { deleteOpportunityAction, setOpportunityStatusAction } from "@/app/actions/company";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function OpportunityActions({ id, slug, status }: { id: string; slug: string; status: string }) {
  const [pending, start] = useTransition();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={pending} className="rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink" aria-label="Actions">
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href={`/opportunities/${slug}`}>
            <Eye /> View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/company/opportunities/${id}/edit`}>
            <Pencil /> Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/company/applicants?opportunity=${id}`}>
            <Users /> Applicants
          </Link>
        </DropdownMenuItem>
        {status === "published" && (
          <DropdownMenuItem
            onSelect={() =>
              start(async () => {
                await setOpportunityStatusAction(id, "closed");
                toast.success("Opportunity closed");
              })
            }
          >
            <Lock /> Close applications
          </DropdownMenuItem>
        )}
        {status === "closed" && (
          <DropdownMenuItem
            onSelect={() =>
              start(async () => {
                await setOpportunityStatusAction(id, "reopen");
                toast.success("Opportunity reopened");
              })
            }
          >
            <RotateCcw /> Reopen
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 [&_svg]:text-red-500"
          onSelect={() => {
            if (!confirm("Delete this opportunity and all its applications? This cannot be undone.")) return;
            start(async () => {
              await deleteOpportunityAction(id);
              toast.success("Opportunity deleted");
            });
          }}
        >
          <Trash2 /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
