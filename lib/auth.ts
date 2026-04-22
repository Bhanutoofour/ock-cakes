import { betterAuth } from "better-auth";

import { db } from "@/lib/db";

const fallbackSecret = "dev-only-better-auth-secret-change-me-1234";
const fallbackBaseUrl = "http://localhost:3000";

export const auth = betterAuth({
  database: db,
  baseURL: process.env.BETTER_AUTH_URL ?? fallbackBaseUrl,
  secret: process.env.BETTER_AUTH_SECRET ?? fallbackSecret,
  emailAndPassword: {
    enabled: true,
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
