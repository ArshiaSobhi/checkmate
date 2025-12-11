import nodemailer from "nodemailer";

type MailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: MailParams) {
  if (!process.env.EMAIL_SERVER_HOST) {
    console.info("[email]", subject, to, html);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? "no-reply@checkmate.app",
    to,
    subject,
    html,
  });
}
