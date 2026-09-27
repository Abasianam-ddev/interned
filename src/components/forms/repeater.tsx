"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input, Label, Textarea } from "@/components/ui/input";

type FieldDef = { key: string; label: string; placeholder?: string; textarea?: boolean; half?: boolean };

/** Repeating group of inputs; each field is submitted as `${prefix}_${key}` (use formData.getAll). */
export function Repeater({
  prefix,
  fields,
  initial,
  addLabel,
  max = 10,
}: {
  prefix: string;
  fields: FieldDef[];
  initial: Record<string, string | undefined>[];
  addLabel: string;
  max?: number;
}) {
  const [rows, setRows] = React.useState(() => initial.map((r, i) => ({ id: i, values: r })));
  const nextId = React.useRef(initial.length);
  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.id} className="relative grid gap-4 rounded-xl border border-line bg-canvas/40 p-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className={f.half ? "" : "sm:col-span-2"}>
              <Label>{f.label}</Label>
              {f.textarea ? (
                <Textarea name={`${prefix}_${f.key}`} defaultValue={row.values[f.key] ?? ""} placeholder={f.placeholder} rows={3} className="min-h-20 bg-white" />
              ) : (
                <Input name={`${prefix}_${f.key}`} defaultValue={row.values[f.key] ?? ""} placeholder={f.placeholder} />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setRows(rows.filter((r) => r.id !== row.id))}
            className="absolute right-3 top-3 rounded-md p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
            aria-label="Remove"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      {rows.length < max && (
        <button
          type="button"
          onClick={() => setRows([...rows, { id: nextId.current++, values: {} }])}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-brand-300 px-3.5 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
        >
          <Plus className="size-4" /> {addLabel}
        </button>
      )}
    </div>
  );
}
