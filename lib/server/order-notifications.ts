import type { Order } from "@/lib/store-schema";

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

async function sendEmailNotification(order: Order) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_NOTIFICATION_FROM_EMAIL;
  const to = splitEnvList(process.env.ORDER_NOTIFICATION_TO_EMAIL);

  if (!apiKey || !from || to.length === 0) {
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `order-email-${order.id}`,
    },
    body: JSON.stringify({
      from,
      to,
      subject: `New Order ${order.orderNumber} - Rs. ${order.pricing.total}`,
      html: buildEmailHtml(order),
      text: buildEmailText(order),
    }),
  });

  if (!response.ok) {
    throw new Error(`Email notification failed with status ${response.status}`);
  }
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
    sendEmailNotification(order),
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
