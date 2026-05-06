"use client";

import { useState, useTransition } from "react";
import { createPesanan } from "@/actions/pesanan";
import type { PesananJenis } from "@/lib/types";

const JENIS_OPTIONS: PesananJenis[] = ["Satuan", "Custom", "Grosir"];

export function BuatPesananForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createPesanan(fd);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      onSuccess?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-[8px] bg-danger-soft px-4 py-3 text-[13px] font-medium text-danger">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-[8px] bg-sage-soft px-4 py-3 text-[13px] font-medium text-sage">
          Pesanan berhasil dibuat
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
          Nama Pemesan *
        </label>
        <input
          name="nama_pemesan"
          required
          placeholder="Nama lengkap"
          className="rounded-[8px] border border-border bg-bg2 px-4 py-3 text-[14px] text-text placeholder:text-text-mute focus:border-border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 disabled:opacity-60"
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
          Kontak / No. HP
        </label>
        <input
          name="kontak"
          type="tel"
          placeholder="08xx-xxxx-xxxx"
          className="rounded-[8px] border border-border bg-bg2 px-4 py-3 text-[14px] text-text placeholder:text-text-mute focus:border-border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 disabled:opacity-60"
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
          Jenis Pesanan *
        </label>
        <div className="relative">
          <select
            name="jenis"
            required
            defaultValue="Satuan"
            className="w-full appearance-none rounded-[8px] border border-border bg-bg2 py-3 pl-4 pr-10 text-[14px] text-text focus:border-border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 disabled:opacity-60"
            disabled={isPending}
          >
            {JENIS_OPTIONS.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B887D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
          Detail Pesanan *
        </label>
        <textarea
          name="detail"
          required
          rows={3}
          placeholder="Nama buku, jumlah, spesifikasi..."
          className="rounded-[8px] border border-border bg-bg2 px-4 py-3 text-[14px] text-text placeholder:text-text-mute focus:border-border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 disabled:opacity-60 resize-none"
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
          Catatan Tambahan
        </label>
        <textarea
          name="catatan"
          rows={2}
          placeholder="Info tambahan..."
          className="rounded-[8px] border border-border bg-bg2 px-4 py-3 text-[14px] text-text placeholder:text-text-mute focus:border-border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 disabled:opacity-60 resize-none"
          disabled={isPending}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 rounded-[8px] bg-sage py-3.5 text-[14px] font-semibold text-white transition-opacity disabled:opacity-70 active:opacity-80"
      >
        {isPending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Menyimpan...
          </>
        ) : (
          "Buat Pesanan"
        )}
      </button>
    </form>
  );
}
