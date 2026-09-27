import { Badge } from "@/components/ui/badge";
import { APPLICATION_STATUS, OPPORTUNITY_STATUS } from "@/lib/constants";
import type { ApplicationStatus, OpportunityStatus } from "@/db/schema";

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const s = APPLICATION_STATUS[status];
  return (
    <Badge tone={s.tone} size="md">
      <span className="size-1.5 rounded-full bg-current" />
      {s.label}
    </Badge>
  );
}

export function OpportunityStatusBadge({ status }: { status: OpportunityStatus }) {
  const s = OPPORTUNITY_STATUS[status];
  return (
    <Badge tone={s.tone} size="md">
      {s.label}
    </Badge>
  );
}
