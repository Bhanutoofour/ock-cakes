import { randomUUID } from "node:crypto";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getAllowedAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "support@occasionkart.com")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

async function ensureAdminUserExists(email: string) {
  await db.query(
    `
      insert into "user" (
        id,
        name,
        email,
        "emailVerified",
        "createdAt",
        "updatedAt"
      ) values ($1, $2, $3, true, now(), now())
      on conflict (email) do nothing
    `,
    [randomUUID(), "OccasionKart Admin", email],
  );
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string };
    const email = payload.email?.trim().toLowerCase() ?? "";

    if (!email || !isValidEmail(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!getAllowedAdminEmails().includes(email)) {
      return Response.json(
        { error: "This email is not allowed for admin password reset." },
        { status: 403 },
      );
    }

    await ensureAdminUserExists(email);

    await auth.api.requestPasswordReset({
      headers: request.headers,
      body: {
        email,
        redirectTo: "/reset-password",
      },
    });

    return Response.json({
      data: {
        message:
          "If the admin account exists, a reset link has been sent to the admin email.",
      },
    });
  } catch (error) {
    console.error("Admin forgot password request failed", error);
    return Response.json(
      { error: "Unable to send reset request right now. Please try again shortly." },
      { status: 500 },
    );
  }
}
