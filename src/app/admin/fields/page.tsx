import type { Metadata } from "next";
import { deleteFieldAction } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { FieldEditor } from "@/components/admin/field-editor";
import { TableCard, Td, Th } from "@/components/admin/list-toolbar";
import { PageHeader } from "@/components/dashboard/page-header";
import { FieldIcon } from "@/components/shared/field-icon";
import { getFieldsWithCounts } from "@/lib/queries";
import { Trash2 } from "lucide-react";

export const metadata: Metadata = { title: "Fields" };

export default async function AdminFieldsPage() {
  const list = await getFieldsWithCounts();
  return (
    <>
      <PageHeader title="Fields" description="Categories used to organise opportunities." actions={<FieldEditor />} />
      <TableCard minWidth={640}>
        <thead className="border-b border-line">
          <tr>
            <Th>Field</Th>
            <Th>Slug</Th>
            <Th>Live opportunities</Th>
            <Th />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {list.map((f) => (
            <tr key={f.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                    <FieldIcon name={f.icon} className="size-4" />
                  </span>
                  <div>
                    <p className="font-semibold">{f.name}</p>
                    {f.description && <p className="max-w-md truncate text-xs text-muted">{f.description}</p>}
                  </div>
                </div>
              </Td>
              <Td className="font-mono text-xs text-ink/70">{f.slug}</Td>
              <Td>{f.count}</Td>
              <Td className="text-right">
                <div className="flex justify-end gap-1">
                  <FieldEditor field={f} />
                  <ActionButton
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete"
                    confirm={`Delete "${f.name}"? Opportunities in this field will become uncategorised.`}
                    action={deleteFieldAction.bind(null, f.id)}
                    successMessage="Field deleted"
                  >
                    <Trash2 className="text-red-500" />
                  </ActionButton>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </>
  );
}
