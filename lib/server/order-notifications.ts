import type { Order } from "@/lib/store-schema";
import nodemailer from "nodemailer";

function splitEnvList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanPhone(value: string | undefined) {
  return (value ?? "").replace(/\D+/g, "");
}

function buildOrderLines(order: Order) {
  return order.items
    .map((item) => `${item.name} x ${item.quantity} - Rs. ${item.lineTotal}`)
    .join("\n");
}

function buildEmailHtml(order: Order) {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<li><strong>${item.name}</strong> x ${item.quantity} - Rs. ${item.lineTotal}</li>`,
    )
    .join("");

  return `
    <div style="font-family:Segoe UI,Trebuchet MS,sans-serif;color:#2b1812;">
      <h2 style="margin-bottom:8px;">New Order Received</h2>
      <p style="margin:0 0 16px;">Order <strong>${order.orderNumber}</strong> was placed on OccasionKart.</p>
      <p><strong>Customer:</strong> ${order.customer.fullName}</p>
      <p><strong>Phone:</strong> ${order.customer.phone}</p>
      <p><strong>Email:</strong> ${order.customer.email ?? "Not provided"}</p>
      <p><strong>Delivery Date:</strong> ${order.delivery.date}</p>
      <p><strong>Address:</strong> ${order.delivery.address}, ${order.delivery.city}</p>
      <p><strong>Cake Message:</strong> ${order.delivery.cakeMessage ?? "None"}</p>
      <p><strong>Total:</strong> Rs. ${order.pricing.total}</p>
      <h3 style="margin:20px 0 8px;">Items</h3>
      <ul style="padding-left:20px;margin:0;">${itemsHtml}</ul>
    </div>
  `;
}

function buildEmailText(order: Order) {
  return [
    `New order received: ${order.orderNumber}`,
    "",
    `Customer: ${order.customer.fullName}`,
    `Phone: ${order.customer.phone}`,
    `Email: ${order.customer.email ?? "Not provided"}`,
    `Delivery Date: ${order.delivery.date}`,
    `Address: ${order.delivery.address}, ${order.delivery.city}`,
    `Cake Message: ${order.delivery.cakeMessage ?? "None"}`,
    `Total: Rs. ${order.pricing.total}`,
    "",
    "Items:",
    buildOrderLines(order),
  ].join("\n");
}

function buildWhatsAppText(order: Order) {
  return [
    "New OccasionKart order received",
    `Order: ${order.orderNumber}`,
    `Customer: ${order.customer.fullName}`,
    `Phone: ${order.customer.phone}`,
    `Delivery: ${order.delivery.date}`,
    `Total: Rs. ${order.pricing.total}`,
    "",
    "Items:",
    buildOrderLines(order),
  ].join("\n");
}

function buildInternalEmailSubject(order: Order) {
  return `New Order ${order.orderNumber} - Rs. ${order.pricing.total}`;
}

function buildCustomerEmailSubject(order: Order) {
  return `Order Confirmed ${order.orderNumber} | OccasionKart Hyderabad`;
}

function buildCustomerEmailHtml(order: Order) {
  return `
    <div style="font-family:Segoe UI,Trebuchet MS,sans-serif;color:#2b1812;">
      <h2 style="margin-bottom:8px;">Your OccasionKart order is confirmed</h2>
      <p style="margin:0 0 16px;">Hi ${order.customer.fullName}, thanks for ordering with us.</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Delivery Date:</strong> ${order.delivery.date}</p>
      <p><strong>Delivery Address:</strong> ${order.delivery.address}, ${order.delivery.city}</p>
      <p><strong>Total Paid:</strong> Rs. ${order.pricing.total}</p>
      <h3 style="margin:20px 0 8px;">Items</h3>
      <ul style="padding-left:20px;margin:0;">
        ${order.items
          .map(
            (item) =>
              `<li><strong>${item.name}</strong> x ${item.quantity} - Rs. ${item.lineTotal}</li>`,
          )
          .join("")}
      </ul>
      <p style="margin-top:16px;">For support, contact us at support@occasionkart.com.</p>
    </div>
  `;
}

function buildCustomerEmailText(order: Order) {
  return [
    `Hi ${order.customer.fullName}, your OccasionKart order is confirmed.`,
    "",
    `Order Number: ${order.orderNumber}`,
    `Delivery Date: ${order.delivery.date}`,
    `Delivery Address: ${order.delivery.address}, ${order.delivery.city}`,
    `Total Paid: Rs. ${order.pricing.total}`,
    "",
    "Items:",
    buildOrderLines(order),
    "",
    "Support: support@occasionkart.com",
  ].join("\n");
}

function getConfiguredFromEmail() {
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
  to: string[];
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
      to,
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Email notification failed with status ${response.status}`);
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
  to: string[];
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
    to: to.join(","),
    subject,
    html,
    text,
  });

  return true;
}

async function sendOrderEmail({
  order,
  recipients,
  subject,
  html,
  text,
  idempotencyKey,
}: {
  order: Order;
  recipients: string[];
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}) {
  const from = getConfiguredFromEmail();
  if (!from || recipients.length === 0) {
    return;
  }

  const sentByResend = await sendViaResend({
    from,
    to: recipients,
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
    to: recipients,
    subject,
    html,
    text,
  });

  if (!sentBySmtp) {
    throw new Error(
      `No email provider configured for order ${order.orderNumber}. Set RESEND_API_KEY or SMTP/GMAIL env variables.`,
    );
  }
}

async function sendInternalEmailNotification(order: Order) {
  const to = splitEnvList(process.env.ORDER_NOTIFICATION_TO_EMAIL);
  if (to.length === 0) {
    return;
  }

  await sendOrderEmail({
    order,
    recipients: to,
    subject: buildInternalEmailSubject(order),
    html: buildEmailHtml(order),
    text: buildEmailText(order),
    idempotencyKey: `order-email-internal-${order.id}`,
  });
}

async function sendCustomerEmailNotification(order: Order) {
  const customerEmail = order.customer.email?.trim();
  if (!customerEmail) {
    return;
  }

  await sendOrderEmail({
    order,
    recipients: [customerEmail],
    subject: buildCustomerEmailSubject(order),
    html: buildCustomerEmailHtml(order),
    text: buildCustomerEmailText(order),
    idempotencyKey: `order-email-customer-${order.id}`,
  });
}

async function sendWhatsAppWebhook(order: Order) {
  const webhookUrl = process.env.WHATSAPP_NOTIFY_WEBHOOK_URL;
  if (!webhookUrl) {
    return false;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "new_order",
      order,
      message: buildWhatsAppText(order),
    }),
  });

  if (!response.ok) {
    throw new Error(`WhatsApp webhook failed with status ${response.status}`);
  }

  return true;
}

async function sendWhatsAppCloudTemplate(order: Order) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const notifyTo = cleanPhone(process.env.WHATSAPP_NOTIFY_TO);
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  const languageCode = process.env.WHATSAPP_TEMPLATE_LANG ?? "en";

  if (!accessToken || !phoneNumberId || !notifyTo || !templateName) {
    return;
  }

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: notifyTo,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: order.orderNumber },
                { type: "text", text: order.customer.fullName },
                { type: "text", text: order.customer.phone },
                { type: "text", text: String(order.pricing.total) },
              ],
            },
          ],
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`WhatsApp notification failed with status ${response.status}`);
  }
}

export async function sendNewOrderNotifications(order: Order) {
  const results = await Promise.allSettled([
    sendInternalEmailNotification(order),
    sendCustomerEmailNotification(order),
    (async () => {
      const handledByWebhook = await sendWhatsAppWebhook(order);
      if (!handledByWebhook) {
        await sendWhatsAppCloudTemplate(order);
      }
    })(),
  ]);

  const errors = results
    .filter((result): result is PromiseRejectedResult => result.status === "rejected")
    .map((result) => result.reason instanceof Error ? result.reason.message : String(result.reason));

  if (errors.length > 0) {
    throw new Error(errors.join(" | "));
  }
}
