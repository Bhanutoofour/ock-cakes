import { sendSupportEmail } from "@/lib/server/support-mail";

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

    const userAgent = request.headers.get("user-agent") ?? "unknown";
    const requestedAt = new Date().toISOString();
    const subject = `Admin password reset request: ${email}`;
    const html = `
      <div style="font-family:Segoe UI,Trebuchet MS,sans-serif;color:#2b1812;">
        <h2 style="margin-bottom:8px;">Admin Password Reset Request</h2>
        <p style="margin:0 0 12px;">
          A password reset request was submitted for admin login.
        </p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Requested at:</strong> ${requestedAt}</p>
        <p><strong>User agent:</strong> ${userAgent}</p>
      </div>
    `;
    const text = [
      "Admin Password Reset Request",
      "",
      `Email: ${email}`,
      `Requested at: ${requestedAt}`,
      `User agent: ${userAgent}`,
    ].join("\n");

    await sendSupportEmail({
      subject,
      html,
      text,
      idempotencyKey: `admin-forgot-${email}-${requestedAt}`,
    });

    return Response.json({
      data: {
        message:
          "Reset request sent. Support team will contact you on your registered admin email.",
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

