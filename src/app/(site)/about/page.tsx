import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Handshake, KeyRound, ShieldCheck, TrendingUp } from "lucide-react";
import { Markdown } from "@/components/content/markdown";
import { SafeImg } from "@/components/shared/safe-img";
import { Button } from "@/components/ui/button";
import { getPage } from "@/lib/pages";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "About Us" };

export default async function AboutPage() {
  const [page, settings] = await Promise.all([getPage("about"), getSettings()]);
  return (
    <div>
      <section className="container-page grid items-center gap-10 py-14 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold sm:text-5xl">{page?.title ?? "About Internly"}</h1>
          <p className="mt-4 text-lg text-ink/80">{page?.summary ?? "We're on a mission to connect students with real opportunities."}</p>
          {page && <Markdown className="mt-4">{page.content}</Markdown>}
        </div>
        <SafeImg
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
          alt="Students collaborating"
          className="aspect-[4/3] w-full rounded-3xl object-cover shadow-float"
        />
      </section>

      <section className="bg-canvas py-12">
        <dl className="container-page grid gap-6 sm:grid-cols-3">
          {[
            { value: settings.statOpportunities, label: "Active Internships" },
            { value: settings.statStudents, label: "Registered Students" },
            { value: settings.statCompanies, label: "Partner Companies" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-line bg-white p-6 text-center shadow-card">
              <dd className="font-display text-4xl font-extrabold text-brand-700">{s.value}</dd>
              <dt className="mt-1 text-sm text-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-page py-16">
        <h2 className="text-2xl font-bold">Our Values</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: KeyRound, title: "Access", text: "Opportunities should be easy to find, for every student." },
            { icon: ShieldCheck, title: "Trust", text: "Verified and reliable opportunities you can count on." },
            { icon: TrendingUp, title: "Growth", text: "Real experience that shapes your future." },
            { icon: Handshake, title: "Community", text: "A stronger student network that lifts everyone." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-line p-6 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <Icon className="size-6" />
              </div>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-2 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-brand-900 p-10 text-white sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">Your future is built by the opportunities you take.</h2>
            <p className="mt-2 font-script text-3xl text-brand-300">Internly</p>
          </div>
          <Button asChild className="bg-white text-brand-900 hover:bg-brand-50" size="lg">
            <Link href="/opportunities">
              Explore Internships <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
