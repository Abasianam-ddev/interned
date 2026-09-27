import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { FileText, GraduationCap, Mail, MapPin, Phone } from "lucide-react";
import { db } from "@/db";
import { studentProfiles } from "@/db/schema";
import { updateProfileAction } from "@/app/actions/student";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { CheckboxGroup, FileField, ImageField, SelectField, TextAreaField, TextField } from "@/components/forms/fields";
import { Repeater } from "@/components/forms/repeater";
import { TagInput } from "@/components/forms/tag-input";
import { ActionForm, SubmitButton } from "@/components/shared/action-form";
import { UserAvatar } from "@/components/shared/company-logo";
import { Label } from "@/components/ui/input";
import { requireUser } from "@/lib/auth";
import { LEVELS } from "@/lib/constants";
import { getAllFields } from "@/lib/queries";
import { profileCompletion } from "@/lib/student";

export const metadata: Metadata = { title: "My Profile" };

const SKILL_SUGGESTIONS = ["HTML", "CSS", "JavaScript", "React", "Python", "Excel", "SQL", "Figma", "Communication", "Canva", "Git", "Public Speaking"];

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <h2 className="font-bold">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function ProfilePage({ searchParams }: PageProps<"/dashboard/profile">) {
  const user = await requireUser(["student"]);
  const sp = await searchParams;
  const [profile, allFields] = await Promise.all([
    db.query.studentProfiles.findFirst({ where: eq(studentProfiles.userId, user.id) }),
    getAllFields(),
  ]);
  const completion = profileCompletion(user, profile);

  return (
    <>
      <PageHeader title="My Profile" description="A complete profile helps companies get to know you and improves your recommendations." />
      {sp.welcome && (
        <div className="mb-6 rounded-2xl bg-brand-900 p-6 text-white">
          <h2 className="text-lg font-bold">Welcome to Internly! 🎉</h2>
          <p className="mt-1 text-sm text-white/75">Take two minutes to complete your profile — it makes applying faster and helps us recommend the right opportunities.</p>
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <div className="rounded-2xl border border-line bg-white p-6 text-center shadow-card">
            <UserAvatar name={user.name} src={user.avatarUrl} className="mx-auto size-20 text-2xl" />
            <h2 className="mt-3 text-lg font-bold">{user.name}</h2>
            {profile?.headline && <p className="text-sm text-muted">{profile.headline}</p>}
            <ul className="mt-5 space-y-2.5 text-left text-sm text-ink/80">
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 text-brand-700" /> <span className="truncate">{user.email}</span>
              </li>
              {user.phone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="size-4 text-brand-700" /> {user.phone}
                </li>
              )}
              {profile?.school && (
                <li className="flex items-center gap-2.5">
                  <GraduationCap className="size-4 text-brand-700" /> {profile.school}
                </li>
              )}
              {profile?.location && (
                <li className="flex items-center gap-2.5">
                  <MapPin className="size-4 text-brand-700" /> {profile.location}
                </li>
              )}
              {profile?.cvUrl && (
                <li className="flex items-center gap-2.5">
                  <FileText className="size-4 text-brand-700" />
                  <a href={profile.cvUrl} target="_blank" rel="noreferrer" className="truncate text-brand-700 hover:underline">
                    {profile.cvName ?? "My CV"}
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
            <div className="flex items-center gap-4">
              <ProgressRing percent={completion.percent} />
              <div>
                <h3 className="font-bold">Profile strength</h3>
                <p className="text-xs text-muted">{completion.percent === 100 ? "Your profile is complete!" : "Finish these to stand out:"}</p>
              </div>
            </div>
            {completion.missing.length > 0 && (
              <ul className="mt-4 space-y-1.5 text-xs text-ink/70">
                {completion.missing.map((m) => (
                  <li key={m}>• {m}</li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <ActionForm action={updateProfileAction} className="space-y-6">
          <Card title="Basic information">
            <ImageField name="avatar" label="Profile photo" current={user.avatarUrl} className="mb-5" />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField name="name" label="Full name" required defaultValue={user.name} />
              <TextField name="phone" label="Phone number" type="tel" defaultValue={user.phone ?? ""} placeholder="+234 801 234 5678" />
              <TextField name="headline" label="Headline" className="sm:col-span-2" defaultValue={profile?.headline ?? ""} placeholder="e.g. Computer Science student & aspiring frontend engineer" />
              <TextField name="location" label="Location" defaultValue={profile?.location ?? ""} placeholder="e.g. Uyo, Akwa Ibom" />
            </div>
            <TextAreaField name="bio" label="About me" className="mt-5" rows={4} maxLength={1500} defaultValue={profile?.bio ?? ""} placeholder="Tell companies a bit about yourself, your interests and goals." />
          </Card>

          <Card title="Education">
            <div className="grid gap-5 sm:grid-cols-3">
              <TextField name="school" label="University / School" defaultValue={profile?.school ?? ""} placeholder="University of Uyo" />
              <TextField name="course" label="Course" defaultValue={profile?.course ?? ""} placeholder="Computer Science" />
              <SelectField name="level" label="Level" options={LEVELS} placeholder="Select level" defaultValue={profile?.level ?? ""} />
            </div>
          </Card>

          <Card title="Skills & interests" description="Used to recommend opportunities that match you.">
            <Label>Skills</Label>
            <TagInput name="skills" defaultValue={profile?.skills ?? []} suggestions={SKILL_SUGGESTIONS} placeholder="Add a skill and press Enter" />
            <Label className="mt-6">Fields you&apos;re interested in</Label>
            <CheckboxGroup name="interests" options={allFields.map((f) => ({ value: f.id, label: f.name }))} defaultValue={profile?.interests ?? []} />
          </Card>

          <Card title="Experience" description="Internships, jobs, volunteering or leadership roles.">
            <Repeater
              prefix="exp"
              addLabel="Add experience"
              initial={profile?.experience ?? []}
              fields={[
                { key: "role", label: "Role", placeholder: "e.g. Social Media Volunteer", half: true },
                { key: "company", label: "Organization", placeholder: "e.g. GDSC Uniuyo", half: true },
                { key: "period", label: "Period", placeholder: "e.g. Jan 2025 – Present", half: true },
                { key: "description", label: "What did you do?", textarea: true },
              ]}
            />
          </Card>

          <Card title="Projects">
            <Repeater
              prefix="proj"
              addLabel="Add project"
              initial={profile?.projects ?? []}
              fields={[
                { key: "title", label: "Project title", placeholder: "e.g. Portfolio Website", half: true },
                { key: "url", label: "Link", placeholder: "https://", half: true },
                { key: "description", label: "Description", textarea: true },
              ]}
            />
          </Card>

          <Card title="Links & CV">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField name="linkedin" label="LinkedIn" defaultValue={profile?.links.linkedin ?? ""} placeholder="https://linkedin.com/in/…" />
              <TextField name="github" label="GitHub" defaultValue={profile?.links.github ?? ""} placeholder="https://github.com/…" />
              <TextField name="portfolio" label="Portfolio / Website" defaultValue={profile?.links.portfolio ?? ""} placeholder="https://" />
              <TextField name="twitter" label="X (Twitter)" defaultValue={profile?.links.twitter ?? ""} placeholder="https://x.com/…" />
            </div>
            <FileField name="cv" label="CV / Resume" className="mt-5" current={profile?.cvUrl ? { name: profile.cvName ?? "CV", url: profile.cvUrl } : null} />
          </Card>

          <div className="sticky bottom-4 z-10 flex justify-end">
            <SubmitButton size="lg" className="shadow-float">
              Save Profile
            </SubmitButton>
          </div>
        </ActionForm>
      </div>
    </>
  );
}
