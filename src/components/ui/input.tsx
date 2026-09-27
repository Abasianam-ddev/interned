import * as React from "react";
import { cn } from "@/lib/utils";

export const inputClass =
  "h-11 w-full rounded-lg border border-line bg-white px-3.5 text-sm text-ink placeholder:text-muted/70 transition focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15 disabled:bg-canvas disabled:opacity-70 aria-invalid:border-red-400";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputClass, "h-auto min-h-28 py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        inputClass,
        "cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2310201b%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[position:right_12px_center] bg-no-repeat pr-10",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-[13px] font-medium text-ink/80", className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
  required,
}: {
  label?: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: string;
  className?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Checkbox({ className, label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: React.ReactNode }) {
  const box = <input type="checkbox" className={cn("size-4 cursor-pointer rounded border-line", className)} {...props} />;
  if (!label) return box;
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink/85">
      {box}
      <span>{label}</span>
    </label>
  );
}
