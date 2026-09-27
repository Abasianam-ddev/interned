"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFieldError } from "@/components/shared/action-form";

export function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement> & { name: string }) {
  const [show, setShow] = React.useState(false);
  const error = useFieldError(props.name);
  return (
    <div>
      <div className="relative">
        <Input {...props} id={props.id ?? props.name} type={show ? "text" : "password"} className="pr-11" aria-invalid={!!error || undefined} />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted hover:text-ink"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
