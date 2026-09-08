import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

export async function sendMail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log(`[mailer] SMTP not configured — skipping email to ${to}: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@complygem.gov.in",
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("[mailer] Failed to send email:", (err as Error).message);
  }
}
