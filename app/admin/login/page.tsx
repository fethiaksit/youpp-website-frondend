"use client";

import { FormEvent, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import { setTokens } from "@/lib/auth";

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await apiRequest<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setTokens(response.accessToken, response.refreshToken);
      window.location.href = "/admin";
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Login failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-8 shadow-2xl shadow-black/40">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Admin
          </p>
          <h1 className="text-3xl font-semibold text-white">Sign in</h1>
          <p className="text-sm text-slate-300">
            Use your credentials to manage your website.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <label className="block text-sm text-slate-200">
            Email
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-white/40 focus:outline-none"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="block text-sm text-slate-200">
            Password
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-white/40 focus:outline-none"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <button
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
