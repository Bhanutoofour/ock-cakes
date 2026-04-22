import { redirect } from "next/navigation";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Login | OccasionKart",
  description:
    "Sign in to your OccasionKart account to manage cake orders, saved delivery details, and customer information.",
  keywords: ["OccasionKart login", "customer account login"],
});

export default function RegisterPage() {
  redirect("/login");
}
