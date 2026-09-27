"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/** Opens children (usually an ActionForm) in a dialog; closes when the form reports success. */
export function EditDialog({
  title,
  trigger,
  children,
}: {
  title: string;
  trigger?: React.ReactNode;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon-sm" aria-label="Edit">
            <Pencil />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent title={title}>{children(() => setOpen(false))}</DialogContent>
    </Dialog>
  );
}
