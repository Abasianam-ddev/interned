import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNaira(amount: number | null | undefined) {
  if (amount == null) return "Unpaid";
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function formatStipend(amount: number | null | undefined, paid = true) {
  if (!paid || amount == null || amount === 0) return "Unpaid";
  return `${formatNaira(amount)}/month`;
}

export function formatDuration(months: number | null | undefined) {
  if (!months) return "Flexible";
  return `${months} month${months === 1 ? "" : "s"}`;
}

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value.length === 10 ? `${value}T00:00:00Z` : value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return dateFmt.format(d);
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function timeAgo(value: Date | string) {
  const d = new Date(value);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  const units: [number, string][] = [
    [60 * 60 * 24 * 365, "year"],
    [60 * 60 * 24 * 30, "month"],
    [60 * 60 * 24 * 7, "week"],
    [60 * 60 * 24, "day"],
    [60 * 60, "hour"],
    [60, "minute"],
  ];
  for (const [secs, label] of units) {
    if (diff >= secs) {
      const n = Math.floor(diff / secs);
      return `${n} ${label}${n === 1 ? "" : "s"} ago`;
    }
  }
  return "just now";
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function randomSuffix(len = 5) {
  return Math.random().toString(36).slice(2, 2 + len);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function isDeadlinePassed(deadline: string | null | undefined) {
  if (!deadline) return false;
  const today = new Date().toISOString().slice(0, 10);
  return deadline < today;
}

/** Split a textarea value (one item per line) into a clean list. */
export function lines(value: FormDataEntryValue | null | undefined): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(/\r?\n/)
    .map((s) => s.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

/** Split a comma separated value into a clean list. */
export function csv(value: FormDataEntryValue | null | undefined): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function str(value: FormDataEntryValue | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

export function optStr(value: FormDataEntryValue | null | undefined): string | null {
  const s = str(value);
  return s === "" ? null : s;
}

export function optInt(value: FormDataEntryValue | null | undefined): number | null {
  const s = str(value).replace(/[,\s₦]/g, "");
  if (s === "") return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

export function safeUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const u = new URL(value.startsWith("http") ? value : `https://${value}`);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function pluralize(n: number, word: string, plural = `${word}s`) {
  return `${n.toLocaleString()} ${n === 1 ? word : plural}`;
}

/** Midnight (server local time) `days` days ago. */
export function daysAgo(days: number) {
  const d = new Date(Date.now() - days * 86400000);
  d.setHours(0, 0, 0, 0);
  return d;
}
