import type { ApplicationStatus, Eligibility, OpportunityStatus, OpportunityType, WorkMode } from "@/db/schema";

export const SITE_NAME = "Internly";
export const SITE_TAGLINE = "Find Your Next Opportunity.";

export const OPPORTUNITY_TYPES: { value: OpportunityType; label: string }[] = [
  { value: "internship", label: "Internship" },
  { value: "siwes", label: "SIWES / IT" },
  { value: "remote_internship", label: "Remote Internship" },
  { value: "graduate", label: "Graduate Internship" },
  { value: "entry_level", label: "Entry Level" },
  { value: "volunteer", label: "Volunteer" },
];

export const TYPE_LABEL = Object.fromEntries(OPPORTUNITY_TYPES.map((t) => [t.value, t.label])) as Record<
  OpportunityType,
  string
>;

export const WORK_MODES: { value: WorkMode; label: string }[] = [
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
];

export const WORK_MODE_LABEL: Record<WorkMode, string> = { remote: "Remote", onsite: "On-site", hybrid: "Hybrid" };

export const ELIGIBILITY: { value: Eligibility; label: string }[] = [
  { value: "students", label: "Students Welcome" },
  { value: "graduates", label: "Graduates Welcome" },
  { value: "both", label: "Students & Graduates Welcome" },
];

export const ELIGIBILITY_LABEL = Object.fromEntries(ELIGIBILITY.map((e) => [e.value, e.label])) as Record<
  Eligibility,
  string
>;

export const DURATIONS = [
  { value: "1", label: "1 month" },
  { value: "3", label: "3 months" },
  { value: "6", label: "6 months" },
  { value: "12", label: "12 months" },
];

export const LOCATIONS = [
  "Remote",
  "Lagos",
  "Abuja",
  "Uyo",
  "Port Harcourt",
  "Ibadan",
  "Enugu",
  "Kano",
  "Benin City",
  "Calabar",
];

export const LEVELS = ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "Graduate", "Postgraduate"];

export const APPLICATION_STATUS: Record<
  ApplicationStatus,
  { label: string; tone: "gray" | "amber" | "green" | "blue" | "red" | "purple" }
> = {
  draft: { label: "Draft", tone: "gray" },
  submitted: { label: "Submitted", tone: "blue" },
  under_review: { label: "Under Review", tone: "amber" },
  shortlisted: { label: "Shortlisted", tone: "green" },
  interview: { label: "Interview", tone: "purple" },
  accepted: { label: "Accepted", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
  withdrawn: { label: "Withdrawn", tone: "gray" },
};

/** The ordered pipeline shown on the application details timeline. */
export const APPLICATION_PIPELINE: ApplicationStatus[] = [
  "submitted",
  "under_review",
  "shortlisted",
  "interview",
  "accepted",
];

export const OPPORTUNITY_STATUS: Record<
  OpportunityStatus,
  { label: string; tone: "gray" | "amber" | "green" | "blue" | "red" | "purple" }
> = {
  draft: { label: "Draft", tone: "gray" },
  pending: { label: "Pending Review", tone: "amber" },
  published: { label: "Published", tone: "green" },
  closed: { label: "Closed", tone: "gray" },
  rejected: { label: "Rejected", tone: "red" },
};

export const RESOURCE_CATEGORIES = [
  { value: "cv-tips", label: "CV Tips" },
  { value: "interview-prep", label: "Interview Prep" },
  { value: "skills", label: "Skills" },
  { value: "career-growth", label: "Career Growth" },
  { value: "siwes", label: "SIWES / IT" },
  { value: "student-life", label: "Student Life" },
];

export const RESOURCE_CATEGORY_LABEL = Object.fromEntries(RESOURCE_CATEGORIES.map((c) => [c.value, c.label]));

export const REPORT_REASONS = [
  "Asks for payment or fees",
  "Fake or misleading company",
  "Suspicious application link",
  "Inappropriate content",
  "Opportunity no longer exists",
  "Other",
];

export const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

export const FIELD_ICONS = [
  "monitor",
  "cog",
  "palette",
  "megaphone",
  "briefcase",
  "landmark",
  "graduation-cap",
  "heart-pulse",
  "calculator",
  "database",
  "scale",
  "leaf",
  "camera",
  "users",
] as const;
