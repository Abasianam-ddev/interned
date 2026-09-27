"use client";

import * as React from "react";
import { Upload, FileText, X } from "lucide-react";
import { useFieldError } from "@/components/shared/action-form";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Common = { name: string; label?: React.ReactNode; hint?: React.ReactNode; required?: boolean; className?: string };

function Wrap({ name, label, hint, required, className, children }: Common & { children: React.ReactNode }) {
  const error = useFieldError(name);
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </Label>
      )}
      {children}
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function TextField({
  name,
  label,
  hint,
  required,
  className,
  ...props
}: Common & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">) {
  const error = useFieldError(name);
  return (
    <Wrap name={name} label={label} hint={hint} required={required} className={className}>
      <Input id={name} name={name} aria-invalid={!!error || undefined} required={required} {...props} />
    </Wrap>
  );
}

export function TextAreaField({
  name,
  label,
  hint,
  required,
  className,
  ...props
}: Common & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name">) {
  const error = useFieldError(name);
  return (
    <Wrap name={name} label={label} hint={hint} required={required} className={className}>
      <Textarea id={name} name={name} aria-invalid={!!error || undefined} required={required} {...props} />
    </Wrap>
  );
}

export function SelectField({
  name,
  label,
  hint,
  required,
  className,
  options,
  placeholder,
  ...props
}: Common &
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name"> & {
    options: (string | { value: string; label: string })[];
    placeholder?: string;
  }) {
  const error = useFieldError(name);
  return (
    <Wrap name={name} label={label} hint={hint} required={required} className={className}>
      <Select id={name} name={name} aria-invalid={!!error || undefined} required={required} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => {
          const opt = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </Select>
    </Wrap>
  );
}

export function FileField({
  name,
  label,
  hint,
  required,
  className,
  accept,
  current,
}: Common & { accept?: string; current?: { name: string; url: string } | null }) {
  const [file, setFile] = React.useState<File | null>(null);
  const ref = React.useRef<HTMLInputElement>(null);
  const error = useFieldError(name);
  return (
    <Wrap name={name} label={label} hint={hint} required={required} className={className}>
      <label
        htmlFor={name}
        className={cn(
          "flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-line bg-canvas/50 p-4 transition hover:border-brand-300 hover:bg-brand-50/50",
          error && "border-red-300",
        )}
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
          {file || current ? <FileText className="size-5" /> : <Upload className="size-5" />}
        </div>
        <div className="min-w-0 flex-1">
          {file ? (
            <p className="truncate text-sm font-medium">{file.name}</p>
          ) : current ? (
            <p className="truncate text-sm font-medium">
              {current.name} <span className="font-normal text-muted">(uploaded)</span>
            </p>
          ) : (
            <p className="text-sm font-medium">Click to upload</p>
          )}
          <p className="text-xs text-muted">{file || current ? "Click to replace" : "PDF or Word document, max 5MB"}</p>
        </div>
        {file && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setFile(null);
              if (ref.current) ref.current.value = "";
            }}
            className="rounded-md p-1 text-muted hover:bg-white"
            aria-label="Remove file"
          >
            <X className="size-4" />
          </button>
        )}
      </label>
      <input
        ref={ref}
        id={name}
        name={name}
        type="file"
        accept={accept ?? ".pdf,.doc,.docx"}
        className="sr-only"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
    </Wrap>
  );
}

export function ImageField({
  name,
  label,
  current,
  className,
  shape = "circle",
}: {
  name: string;
  label?: string;
  current?: string | null;
  className?: string;
  shape?: "circle" | "square" | "wide";
}) {
  const [preview, setPreview] = React.useState<string | null>(current ?? null);
  const error = useFieldError(name);
  return (
    <div className={className}>
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "overflow-hidden border border-line bg-canvas",
            shape === "circle" && "size-20 rounded-full",
            shape === "square" && "size-20 rounded-2xl",
            shape === "wide" && "h-24 w-48 rounded-xl",
          )}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className={cn("size-full", shape === "square" ? "object-contain" : "object-cover")} />
          ) : (
            <div className="flex size-full items-center justify-center text-muted">
              <Upload className="size-5" />
            </div>
          )}
        </div>
        <label className="cursor-pointer rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-medium hover:bg-brand-50">
          {preview ? "Change image" : "Upload image"}
          <input
            type="file"
            name={name}
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPreview(URL.createObjectURL(f));
            }}
          />
        </label>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

/** Checkbox list that submits every checked value under the same name. */
export function CheckboxGroup({
  name,
  options,
  defaultValue = [],
  className,
}: {
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((o) => (
        <label key={o.value} className="cursor-pointer">
          <input type="checkbox" name={name} value={o.value} defaultChecked={defaultValue.includes(o.value)} className="peer sr-only" />
          <span className="inline-flex items-center rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-medium text-ink/75 transition peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500">
            {o.label}
          </span>
        </label>
      ))}
    </div>
  );
}
