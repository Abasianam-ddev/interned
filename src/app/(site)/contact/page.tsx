import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { contactAction } from "@/app/actions/public";
import { ActionForm, SubmitButton } from "@/components/shared/action-form";
import { TextAreaField, TextField } from "@/components/forms/fields";
import { FacebookIcon, InstagramIcon, LinkedInIcon, XIcon } from "@/components/shared/brand-icons";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const s = await getSettings();
  return (
    <div className="bg-canvas/60 py-12">
      <div className="container-page">
        <h1 className="text-[28px] font-bold">Get in Touch</h1>
        <p className="mt-1 text-sm text-muted">Have questions or need support? We&apos;d love to hear from you.</p>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            <div className="space-y-6 rounded-2xl border border-line bg-white p-6 shadow-card">
              {[
                { icon: Mail, label: "Email", value: s.contactEmail, href: `mailto:${s.contactEmail}` },
                { icon: Phone, label: "Phone", value: s.contactPhone, href: `tel:${s.contactPhone.replace(/\s/g, "")}` },
                { icon: MapPin, label: "Location", value: s.contactAddress },
                { icon: Clock, label: "Business Hours", value: s.businessHours },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="flex size-11 items-center justify-center rounded-full bg-brand-700 text-white">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm text-ink/75 hover:text-brand-700">
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm text-ink/75">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-brand-900 p-6 text-white">
              <Send className="absolute -right-2 top-4 size-24 -rotate-12 text-brand-700" />
              <h2 className="relative font-bold">Follow us for updates</h2>
              <p className="relative mt-1 text-sm text-white/70">Get the latest internship opportunities and career tips.</p>
              <div className="relative mt-5 flex gap-2">
                {[
                  { href: s.social.twitter, icon: XIcon, label: "X" },
                  { href: s.social.instagram, icon: InstagramIcon, label: "Instagram" },
                  { href: s.social.linkedin, icon: LinkedInIcon, label: "LinkedIn" },
                  { href: s.social.facebook, icon: FacebookIcon, label: "Facebook" },
                ]
                  .filter((x) => x.href)
                  .map(({ href, icon: Icon, label }) => (
                    <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="flex size-10 items-center justify-center rounded-full border border-white/25 hover:bg-white/10">
                      <Icon className="size-4" />
                    </a>
                  ))}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
            <ActionForm action={contactAction} resetOnSuccess className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField name="name" label="Full Name" required placeholder="John Doe" />
                <TextField name="email" type="email" label="Email Address" required placeholder="you@example.com" />
              </div>
              <TextField name="subject" label="Subject" placeholder="How can we help?" />
              <TextAreaField name="message" label="Message" required rows={7} placeholder="Write your message…" />
              <SubmitButton size="lg" className="w-full bg-brand-700 hover:bg-brand-800 sm:w-auto sm:px-10">
                Send Message <Send />
              </SubmitButton>
            </ActionForm>
          </div>
        </div>
      </div>
    </div>
  );
}
