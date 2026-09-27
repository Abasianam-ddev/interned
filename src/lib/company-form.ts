import "server-only";
import { z } from "zod";
import { fail, zodFieldErrors } from "./action-state";
import { COMPANY_SIZES } from "./constants";
import { UploadError, saveUpload } from "./uploads";
import { optInt, optStr, safeUrl, str } from "./utils";

const companySchema = z.object({
  name: z.string().trim().min(2, "Enter the company name").max(100),
  tagline: z.string().trim().max(120).optional(),
  description: z.string().trim().max(4000).optional(),
  industry: z.string().trim().max(80).optional(),
  location: z.string().trim().max(100).optional(),
  website: z.string().trim().optional(),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email")]).optional(),
  phone: z.string().trim().max(30).optional(),
  size: z.enum(COMPANY_SIZES as [string, ...string[]]).or(z.literal("")).optional(),
  brandColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
});

export async function companyValuesFromForm(formData: FormData) {
  const parsed = companySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: fail("Please check the highlighted fields.", zodFieldErrors(parsed.error.issues)) };
  const d = parsed.data;
  const websiteRaw = str(formData.get("website"));
  const website = websiteRaw ? safeUrl(websiteRaw) : null;
  if (websiteRaw && !website) return { error: fail("Enter a valid website.", { website: "Invalid URL" }) };
  let logo: Awaited<ReturnType<typeof saveUpload>> = null;
  let cover: Awaited<ReturnType<typeof saveUpload>> = null;
  try {
    logo = await saveUpload(formData.get("logo"), "image");
    cover = await saveUpload(formData.get("cover"), "image");
  } catch (e) {
    if (e instanceof UploadError) return { error: fail(e.message) };
    throw e;
  }
  const founded = optInt(formData.get("foundedYear"));
  return {
    values: {
      name: d.name,
      tagline: d.tagline || null,
      description: d.description || null,
      industry: d.industry || null,
      location: d.location || null,
      website,
      email: d.email || null,
      phone: d.phone || null,
      size: d.size || null,
      foundedYear: founded && founded > 1800 && founded <= new Date().getFullYear() ? founded : null,
      ...(d.brandColor ? { brandColor: d.brandColor } : {}),
      socials: {
        linkedin: safeUrl(optStr(formData.get("linkedin"))) ?? undefined,
        twitter: safeUrl(optStr(formData.get("twitter"))) ?? undefined,
        instagram: safeUrl(optStr(formData.get("instagram"))) ?? undefined,
      },
      ...(logo ? { logoUrl: logo.url } : {}),
      ...(cover ? { coverUrl: cover.url } : {}),
    },
  };
}

