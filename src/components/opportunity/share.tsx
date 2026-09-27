"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { LinkedInIcon, WhatsAppIcon, XIcon } from "@/components/shared/brand-icons";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const text = encodeURIComponent(`${title} — apply on Internly`);
  const u = encodeURIComponent(url);
  const cls =
    "flex size-10 items-center justify-center rounded-full border border-line bg-white transition hover:border-brand-300 hover:bg-brand-50";
  return (
    <div className="flex gap-3">
      <a className={cls} href={`https://wa.me/?text=${text}%20${u}`} target="_blank" rel="noreferrer" aria-label="Share on WhatsApp">
        <WhatsAppIcon className="size-5 text-[#25D366]" />
      </a>
      <a className={cls} href={`https://x.com/intent/tweet?text=${text}&url=${u}`} target="_blank" rel="noreferrer" aria-label="Share on X">
        <XIcon className="size-4 text-black" />
      </a>
      <a
        className={cls}
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on LinkedIn"
      >
        <LinkedInIcon className="size-4 text-[#0A66C2]" />
      </a>
      <button
        type="button"
        className={cls}
        aria-label="Copy link"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied");
          } catch {
            toast.error("Could not copy link");
          }
        }}
      >
        <Copy className="size-4 text-ink/70" />
      </button>
    </div>
  );
}
