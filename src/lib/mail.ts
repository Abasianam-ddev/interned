import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transporter;
}

export function appUrl(path = "") {
  const base = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function sendMail(opts: { to: string; subject: string; text: string; cta?: { label: string; url: string } }) {
  const html = `
  <div style="font-family:Inter,Arial,sans-serif;background:#f6faf8;padding:32px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #e3eee9">
      <div style="font-weight:800;font-size:22px;color:#064e3b;margin-bottom:16px">Internly</div>
      ${opts.text
        .split("\n\n")
        .map((p) => `<p style="color:#1f2d27;line-height:1.6;font-size:15px">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
        .join("")}
      ${
        opts.cta
          ? `<p style="margin-top:24px"><a href="${opts.cta.url}" style="background:#087f5b;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">${escapeHtml(opts.cta.label)}</a></p>`
          : ""
      }
      <p style="color:#6b7a73;font-size:12px;margin-top:32px">Real opportunities. Real experience. A better you.</p>
    </div>
  </div>`;
  const t = getTransporter();
  if (!t) {
    console.info(`[mail] to=${opts.to} subject="${opts.subject}"\n${opts.text}${opts.cta ? `\n${opts.cta.url}` : ""}`);
    return;
  }
  try {
    await t.sendMail({
      from: process.env.MAIL_FROM ?? "Internly <no-reply@internly.ng>",
      to: opts.to,
      subject: opts.subject,
      text: opts.cta ? `${opts.text}\n\n${opts.cta.label}: ${opts.cta.url}` : opts.text,
      html,
    });
  } catch (err) {
    console.error("[mail] failed to send", err);
  }
}
