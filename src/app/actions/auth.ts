"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { companies, passwordResets, studentProfiles, users } from "@/db/schema";
import { createSession, destroySession, getCurrentUser, hashPassword, homeFor, verifyPassword } from "@/lib/auth";
import { fail, success, zodFieldErrors, type ActionState } from "@/lib/action-state";
import { appUrl, sendMail } from "@/lib/mail";
import { notify } from "@/lib/notify";
import { randomSuffix, slugify } from "@/lib/utils";

function safeNext(next: FormDataEntryValue | null) {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Please check the highlighted fields.", zodFieldErrors(parsed.error.issues));
  const { email, password } = parsed.data;
  const user = await db.query.users.findFirst({ where: sql`lower(${users.email}) = ${email}` });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return fail("Incorrect email or password.");
  }
  if (user.status !== "active") return fail("This account has been suspended. Please contact support.");
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  await createSession(user);
  const next = safeNext(formData.get("next"));
  const allowed = next && (user.role === "admin" || !next.startsWith("/admin")) ? next : null;
  redirect(allowed ?? homeFor(user.role));
}

const signupSchema = z
  .object({
    role: z.enum(["student", "company"]),
    name: z.string().trim().min(2, "Enter your full name").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/[0-9]/, "Include at least one number"),
    companyName: z.string().trim().optional(),
    terms: z.literal("on", { message: "You must accept the terms to continue" }),
  })
  .refine((d) => d.role !== "company" || (d.companyName && d.companyName.length >= 2), {
    path: ["companyName"],
    message: "Enter your company or organization name",
  });

export async function signupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Please check the highlighted fields.", zodFieldErrors(parsed.error.issues));
  const { role, name, email, password, companyName } = parsed.data;

  const existing = await db.query.users.findFirst({ where: sql`lower(${users.email}) = ${email}` });
  if (existing) return fail("An account with this email already exists.", { email: "Email is already registered" });

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(users).values({ name, email, passwordHash, role }).returning();
  if (role === "student") {
    await db.insert(studentProfiles).values({ userId: user.id });
  } else {
    let slug = slugify(companyName!);
    if (await db.query.companies.findFirst({ where: eq(companies.slug, slug) })) slug = `${slug}-${randomSuffix()}`;
    await db.insert(companies).values({
      name: companyName!,
      slug,
      ownerId: user.id,
      email,
      status: "active",
      brandColor: ["#111827", "#6d28d9", "#087f5b", "#0f766e", "#b91c1c", "#1d4ed8"][Math.floor(Math.random() * 6)],
    });
  }

  await notify(user.id, {
    type: "welcome",
    title: `Welcome to Internly, ${name.split(" ")[0]}!`,
    body:
      role === "student"
        ? "Complete your profile to get better recommendations."
        : "Complete your company profile and post your first opportunity.",
    link: role === "student" ? "/dashboard/profile" : "/company/profile",
  });
  await sendMail({
    to: email,
    subject: "Welcome to Internly",
    text: `Hi ${name},\n\nYour Internly account is ready. ${
      role === "student"
        ? "Start exploring verified internships and set up alerts so you never miss an opportunity."
        : "You can now post internships and manage applicants from your company dashboard."
    }`,
    cta: { label: "Go to dashboard", url: appUrl(homeFor(role)) },
  });

  await createSession(user);
  const next = safeNext(formData.get("next"));
  redirect(next && !next.startsWith("/admin") ? next : role === "student" ? "/dashboard/profile?welcome=1" : "/company/profile?welcome=1");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function forgotPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!z.string().email().safeParse(email).success) return fail("Enter a valid email address.", { email: "Invalid email" });
  const user = await db.query.users.findFirst({ where: sql`lower(${users.email}) = ${email}` });
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    await db.insert(passwordResets).values({
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    await sendMail({
      to: user.email,
      subject: "Reset your Internly password",
      text: `Hi ${user.name},\n\nWe received a request to reset your password. This link expires in 1 hour. If you didn't request this, you can ignore this email.`,
      cta: { label: "Reset password", url: appUrl(`/reset-password?token=${token}`) },
    });
  }
  return success("If an account exists for that email, we've sent a reset link.");
}

export async function resetPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8 || !/[0-9]/.test(password) || !/[A-Za-z]/.test(password))
    return fail("Password must be at least 8 characters and include a letter and a number.", {
      password: "Too weak",
    });
  if (password !== confirm) return fail("Passwords do not match.", { confirm: "Passwords do not match" });
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const row = await db.query.passwordResets.findFirst({
    where: and(eq(passwordResets.tokenHash, tokenHash), isNull(passwordResets.usedAt), gt(passwordResets.expiresAt, new Date())),
  });
  if (!row) return fail("This reset link is invalid or has expired. Please request a new one.");
  await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, row.userId));
  await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.tokenHash, tokenHash));
  redirect("/login?reset=1");
}

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const current = await getCurrentUser();
  if (!current) return fail("You must be logged in.");
  const user = await db.query.users.findFirst({ where: eq(users.id, current.id) });
  const oldPassword = String(formData.get("currentPassword") ?? "");
  const password = String(formData.get("newPassword") ?? "");
  if (!user || !(await verifyPassword(oldPassword, user.passwordHash)))
    return fail("Your current password is incorrect.", { currentPassword: "Incorrect password" });
  if (password.length < 8 || !/[0-9]/.test(password) || !/[A-Za-z]/.test(password))
    return fail("New password must be at least 8 characters and include a letter and a number.", {
      newPassword: "Too weak",
    });
  await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, user.id));
  return success("Password updated.");
}
