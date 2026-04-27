import nodemailer from "nodemailer";

type SendSupportEmailInput = {
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
  to?: string;
};

function getFromEmail() {
  return process.env.ORDER_NOTIFICATION_FROM_EMAIL ?? process.env.GMAIL_USER;
}

async function sendViaResend({
  from,
  to,
  subject,
  html,
  text,
  idempotencyKey,
}: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Support email failed with status ${response.status}`);
  }

  return true;
}

async function sendViaSmtp({
  from,
  to,
  subject,
  html,
  text,
}: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT ?? 465);
  const smtpSecure = (process.env.SMTP_SECURE ?? "true").toLowerCase() === "true";
  const smtpUser = process.env.SMTP_USER ?? process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS ?? process.env.GMAIL_APP_PASSWORD;

  if (!smtpUser || !smtpPass) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost ?? "smtp.gmail.com",
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });

  return true;
}

export async function sendSupportEmail({
  subject,
  html,
  text,
  idempotencyKey,
  to = process.env.ADMIN_PASSWORD_SUPPORT_EMAIL ?? "support@occasionkart.com",
}: SendSupportEmailInput) {
  const from = getFromEmail();
  if (!from) {
    throw new Error("Missing sender email configuration for support email.");
  }

  const sentByResend = await sendViaResend({
    from,
    to,
    subject,
    html,
    text,
    idempotencyKey,
  });

  if (sentByResend) {
    return;
  }

  const sentBySmtp = await sendViaSmtp({
    from,
    to,
    subject,
    html,
    text,
  });

  if (!sentBySmtp) {
    throw new Error(
      "No mail provider configured. Set RESEND_API_KEY or SMTP/GMAIL environment variables.",
    );
  }
}

