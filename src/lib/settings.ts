import "server-only";
import { cache } from "react";
import { db } from "@/db";
import { settings } from "@/db/schema";

export type SiteSettings = {
  heroBadge: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroSubtitle: string;
  heroScript: string;
  heroImage: string;
  statOpportunities: string;
  statCompanies: string;
  statStudents: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  businessHours: string;
  social: { twitter: string; instagram: string; linkedin: string; facebook: string };
  announcement: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  heroBadge: "Real opportunities. Real experience. A better you.",
  heroTitleLine1: "Find Your Next",
  heroTitleLine2: "Opportunity.",
  heroSubtitle: "Internships and real-world opportunities built for students and young professionals.",
  heroScript: "Your Next Chapter Starts Here",
  heroImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1600&q=80",
  statOpportunities: "500+",
  statCompanies: "200+",
  statStudents: "50k+",
  contactEmail: "hello@internly.ng",
  contactPhone: "+234 812 345 6789",
  contactAddress: "Lagos, Nigeria",
  businessHours: "Mon - Fri, 9am - 5pm",
  social: {
    twitter: "https://x.com/internly",
    instagram: "https://instagram.com/internly",
    linkedin: "https://linkedin.com/company/internly",
    facebook: "https://facebook.com/internly",
  },
  announcement: "",
};

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await db.select().from(settings);
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...DEFAULT_SETTINGS, ...stored, social: { ...DEFAULT_SETTINGS.social, ...(stored.social as object) } } as SiteSettings;
});
