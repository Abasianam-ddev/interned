export function PageHeader({ title, description, actions }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </div>
  );
}

export function StatCard({
  value,
  label,
  icon,
  tone = "green",
}: {
  value: React.ReactNode;
  label: string;
  icon?: React.ReactNode;
  tone?: "green" | "amber" | "blue" | "purple" | "red";
}) {
  const tones = {
    green: "bg-brand-100 text-brand-700",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-sky-50 text-sky-600",
    purple: "bg-violet-50 text-violet-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="flex items-center justify-between rounded-2xl border border-line bg-white p-5 shadow-card">
      <div>
        <p className="font-display text-3xl font-bold text-ink">{value}</p>
        <p className="mt-1 text-[13px] text-muted">{label}</p>
      </div>
      {icon && <div className={`flex size-11 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</div>}
    </div>
  );
}
