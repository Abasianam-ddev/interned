import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { BellRing } from "lucide-react";
import { db } from "@/db";
import { alerts } from "@/db/schema";
import { createAlertAction } from "@/app/actions/student";
import { AlertItem } from "@/components/dashboard/alert-item";
import { PageHeader } from "@/components/dashboard/page-header";
import { CheckboxGroup, SelectField, TextField } from "@/components/forms/fields";
import { ActionForm, SubmitButton } from "@/components/shared/action-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Label } from "@/components/ui/input";
import { requireUser } from "@/lib/auth";
import { LOCATIONS, OPPORTUNITY_TYPES, TYPE_LABEL, WORK_MODES, WORK_MODE_LABEL } from "@/lib/constants";
import { getAllFields } from "@/lib/queries";
import type { OpportunityType, WorkMode } from "@/db/schema";

export const metadata: Metadata = { title: "Opportunity Alerts" };

export default async function AlertsPage() {
  const user = await requireUser(["student"]);
  const [list, allFields] = await Promise.all([
    db.select().from(alerts).where(eq(alerts.userId, user.id)).orderBy(desc(alerts.createdAt)),
    getAllFields(),
  ]);
  const fieldName = Object.fromEntries(allFields.map((f) => [f.id, f.name]));
  return (
    <>
      <PageHeader title="Opportunity Alerts" description="Get notified when new opportunities match your preferences." />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
          <h2 className="font-bold">Create a new alert</h2>
          <ActionForm action={createAlertAction} resetOnSuccess className="mt-5 space-y-6">
            <TextField name="keywords" label="Keywords" placeholder="e.g. React, marketing, data" hint="Optional. We'll match titles, skills and companies." />
            <div>
              <Label>Fields</Label>
              <CheckboxGroup name="fieldIds" options={allFields.map((f) => ({ value: f.id, label: f.name }))} />
            </div>
            <div>
              <Label>Locations</Label>
              <CheckboxGroup name="locations" options={LOCATIONS.map((l) => ({ value: l, label: l }))} />
            </div>
            <div>
              <Label>Opportunity types</Label>
              <CheckboxGroup name="types" options={OPPORTUNITY_TYPES} />
            </div>
            <div>
              <Label>Work mode</Label>
              <CheckboxGroup name="workModes" options={WORK_MODES} />
            </div>
            <SelectField
              name="frequency"
              label="Email frequency"
              defaultValue="weekly"
              className="max-w-xs"
              options={[
                { value: "instant", label: "Instantly" },
                { value: "daily", label: "Daily digest" },
                { value: "weekly", label: "Weekly digest" },
              ]}
            />
            <SubmitButton>Create Alert</SubmitButton>
          </ActionForm>
        </div>
        <div>
          <h2 className="mb-3 font-bold">Your alerts ({list.length})</h2>
          {list.length ? (
            <ul className="divide-y divide-line rounded-2xl border border-line bg-white shadow-card">
              {list.map((a) => {
                const parts = [
                  ...a.fieldIds.map((id) => fieldName[id]).filter(Boolean),
                  ...a.locations,
                  ...a.types.map((t) => TYPE_LABEL[t as OpportunityType] ?? t),
                  ...a.workModes.map((m) => WORK_MODE_LABEL[m as WorkMode] ?? m),
                ];
                return (
                  <AlertItem
                    key={a.id}
                    id={a.id}
                    active={a.active}
                    frequency={a.frequency}
                    title={a.keywords ? `“${a.keywords}”` : parts[0] ?? "All new opportunities"}
                    summary={parts.join(" · ") || "Any field, location and type"}
                  />
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={BellRing} title="No alerts yet" description="Create an alert and we'll email you matching opportunities." />
          )}
        </div>
      </div>
    </>
  );
}
