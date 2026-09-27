import Link from "next/link";
import { FileText } from "lucide-react";
import { UserAvatar } from "@/components/shared/company-logo";
import { ApplicationStatusBadge } from "@/components/shared/status-badge";
import type { ApplicationStatus } from "@/db/schema";
import { formatDate } from "@/lib/utils";

export type ApplicantRow = {
  id: string;
  fullName: string;
  email: string;
  school: string | null;
  course: string | null;
  level: string | null;
  status: ApplicationStatus;
  submittedAt: Date | null;
  cvUrl: string | null;
  opportunityTitle: string;
  avatarUrl: string | null;
};

export function ApplicantTable({ rows, hrefBase, showOpportunity = true }: { rows: ApplicantRow[]; hrefBase: string; showOpportunity?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="border-b border-line text-left text-xs text-muted">
          <tr>
            <th className="px-5 py-3 font-medium">Applicant</th>
            {showOpportunity && <th className="px-5 py-3 font-medium">Opportunity</th>}
            <th className="px-5 py-3 font-medium">Education</th>
            <th className="px-5 py-3 font-medium">Applied</th>
            <th className="px-5 py-3 font-medium">CV</th>
            <th className="px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((a) => (
            <tr key={a.id} className="hover:bg-canvas/60">
              <td className="px-5 py-3.5">
                <Link href={`${hrefBase}/${a.id}`} className="flex items-center gap-3">
                  <UserAvatar name={a.fullName} src={a.avatarUrl} className="size-9 text-xs" />
                  <span className="min-w-0">
                    <span className="block font-semibold hover:text-brand-700">{a.fullName}</span>
                    <span className="block truncate text-xs text-muted">{a.email}</span>
                  </span>
                </Link>
              </td>
              {showOpportunity && <td className="px-5 py-3.5 text-ink/80">{a.opportunityTitle}</td>}
              <td className="px-5 py-3.5 text-ink/75">
                <span className="block">{a.course ?? "—"}</span>
                <span className="block text-xs text-muted">{[a.school, a.level].filter(Boolean).join(" · ")}</span>
              </td>
              <td className="whitespace-nowrap px-5 py-3.5 text-ink/75">{formatDate(a.submittedAt)}</td>
              <td className="px-5 py-3.5">
                {a.cvUrl ? (
                  <a href={a.cvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-700 hover:underline">
                    <FileText className="size-4" /> View
                  </a>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td className="px-5 py-3.5">
                <ApplicationStatusBadge status={a.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
