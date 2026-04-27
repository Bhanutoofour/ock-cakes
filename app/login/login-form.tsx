"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [isForgotPending, setIsForgotPending] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/account",
      });

      if (result.error) {
        setError(result.error.message ?? "Unable to sign in right now.");
        return;
      }

      router.push("/account");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  const handleAdminForgotPassword = async () => {
    setForgotError("");
    setForgotMessage("");

    if (!email.trim()) {
      setForgotError("Enter your admin email first, then click forgot password.");
      return;
    }

    setIsForgotPending(true);
    try {
      const response = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as {
        error?: string;
        data?: { message?: string };
      };

      if (!response.ok) {
        setForgotError(payload.error ?? "Unable to send reset request right now.");
        return;
      }

      setForgotMessage(
        payload.data?.message ??
          "Reset request sent. Support team will contact you on your registered admin email.",
      );
    } finally {
      setIsForgotPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-[520px] rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
      <h1 className="text-[2rem] font-semibold text-black">Login</h1>
      <p className="mt-2 text-[1rem] text-[#6c7396]">
        Welcome back. Sign in to manage your orders.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-[0.9rem] font-semibold text-stone-900" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            required
            autoComplete="email"
            className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-[0.9rem] font-semibold text-stone-900"
            htmlFor="login-password"
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            required
            autoComplete="current-password"
            className="w-full rounded-[12px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            onClick={handleAdminForgotPassword}
            disabled={isForgotPending}
            className="text-[0.88rem] font-semibold text-[#ef7f41] disabled:opacity-70"
          >
            {isForgotPending ? "Sending reset request..." : "Forgot Admin Password?"}
          </button>
        </div>

        {error ? (
          <p className="rounded-[12px] bg-[#fff3f0] px-4 py-3 text-[0.95rem] text-[#b93815]">
            {error}
          </p>
        ) : null}

        {forgotError ? (
          <p className="rounded-[12px] bg-[#fff3f0] px-4 py-3 text-[0.95rem] text-[#b93815]">
            {forgotError}
          </p>
        ) : null}

        {forgotMessage ? (
          <p className="rounded-[12px] bg-[#f3fff2] px-4 py-3 text-[0.95rem] text-[#2f8f2f]">
            {forgotMessage}
          </p>
        ) : null}

        <button
          disabled={isPending}
          className="w-full rounded-full bg-[#ef7f41] px-6 py-3 text-[1rem] font-semibold text-white disabled:opacity-70"
        >
          {isPending ? "Signing In..." : "Sign In"}
        </button>
      </form>

    </div>
  );
}
