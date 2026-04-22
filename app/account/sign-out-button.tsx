"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    setIsPending(true);
    try {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      disabled={isPending}
      className="rounded-full border border-[rgba(0,0,0,0.12)] px-5 py-3 text-[0.95rem] font-semibold text-stone-900 disabled:opacity-70"
      onClick={handleClick}
    >
      {isPending ? "Signing Out..." : "Sign Out"}
    </button>
  );
}
