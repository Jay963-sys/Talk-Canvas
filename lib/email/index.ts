import { Resend } from "resend";
import type { ReactElement } from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  react,
  replyTo,
}: SendEmailOptions) {
  const from =
    process.env.FROM_EMAIL || "Talk Canvas Gallery <onboarding@resend.dev>";

  const result = await resend.emails.send({
    from,
    to,
    subject,
    react,
    replyTo,
  });

  if (result.error) {
    throw new Error(`Resend error: ${JSON.stringify(result.error)}`);
  }

  return result.data;
}
