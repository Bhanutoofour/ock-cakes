import { betterAuth } from "better-auth";

import { db } from "@/lib/db";
import { sendSupportEmail } from "@/lib/server/support-mail";

const fallbackSecret = "dev-only-better-auth-secret-change-me-1234";
const fallbackBaseUrl = "http://localhost:3000";

export const auth = betterAuth({
  database: db,
  baseURL: process.env.BETTER_AUTH_URL ?? fallbackBaseUrl,
  secret: process.env.BETTER_AUTH_SECRET ?? fallbackSecret,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }) => {
      const subject = "Reset your OccasionKart password";
      const html = `
        <div style="font-family:Segoe UI,Trebuchet MS,sans-serif;color:#2b1812;">
          <h2 style="margin-bottom:8px;">Reset your password</h2>
          <p style="margin:0 0 16px;">
            We received a request to reset your OccasionKart account password.
          </p>
          <p style="margin:0 0 20px;">
            <a href="${url}" style="display:inline-block;border-radius:999px;background:#ef7f41;color:#fff;padding:12px 20px;text-decoration:none;font-weight:700;">
              Reset Password
            </a>
          </p>
          <p style="margin:0;color:#6c7396;">
            If you did not request this, you can ignore this email.
          </p>
        </div>
      `;
      const text = [
        "Reset your OccasionKart password",
        "",
        "We received a request to reset your OccasionKart account password.",
        `Reset password: ${url}`,
        "",
        "If you did not request this, you can ignore this email.",
      ].join("\n");

      await sendSupportEmail({
        to: user.email,
        subject,
        html,
        text,
        idempotencyKey: `customer-password-reset-${user.id}-${token}`,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
    },
  },
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
    },
  },
});
