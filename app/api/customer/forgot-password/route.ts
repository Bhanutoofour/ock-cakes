import { auth } from "@/lib/auth";

export const runtime = "nodejs";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string };
    const email = payload.email?.trim().toLowerCase() ?? "";

    if (!email || !isValidEmail(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    await auth.api.requestPasswordReset({
      headers: request.headers,
      body: {
        email,
        redirectTo: "/reset-password",
      },
    });

    return Response.json({
      data: {
        message: "If an account exists for this email, a reset link has been sent.",
      },
    });
  } catch (error) {
    console.error("Customer forgot password request failed", error);
    return Response.json(
      { error: "Unable to send reset request right now. Please try again shortly." },
      { status: 500 },
    );
  }
}
