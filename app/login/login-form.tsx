"use client";

import { useState, useTransition } from "react";
import { login } from "@/actions/auth";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await login(formData);
      if (result && !result.success) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-[8px] border border-danger-soft bg-danger-soft px-4 py-3 text-[13px] font-medium text-danger">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="nama@email.com"
          className="rounded-[8px] border border-border bg-bg2 px-4 py-3 text-[14px] text-text placeholder:text-text-mute focus:border-border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 disabled:opacity-60"
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="rounded-[8px] border border-border bg-bg2 px-4 py-3 text-[14px] text-text placeholder:text-text-mute focus:border-border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 disabled:opacity-60"
          disabled={isPending}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 flex items-center justify-center gap-2 rounded-[8px] bg-sage px-4 py-3.5 text-[14px] font-semibold text-white transition-opacity disabled:opacity-70 active:opacity-80"
      >
        {isPending ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Masuk...
          </>
        ) : (
          "Masuk"
        )}
      </button>
    </form>
  );
}
