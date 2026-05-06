"use client";

import { useState, useTransition } from "react";
import { createKaryawan } from "@/actions/karyawan";

export function TambahKaryawanForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startTransition(async () => {
      const result = await createKaryawan(fd);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      form.reset();
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
      }, 2000);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-border-sage bg-sage py-3 text-[13.5px] font-semibold text-white transition-opacity active:opacity-80"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Tambah Anggota
      </button>
    );
  }

  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-[13.5px] font-semibold text-text">Tambah Anggota Baru</p>
        <button
          onClick={() => { setOpen(false); setError(null); setSuccess(false); }}
          className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-border text-text-dim"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
        {error && (
          <div className="rounded-[8px] border border-danger-soft bg-danger-soft px-3 py-2.5 text-[12.5px] font-medium text-danger">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-[8px] border border-sage-soft bg-sage-soft px-3 py-2.5 text-[12.5px] font-medium text-sage">
            Anggota berhasil ditambahkan!
          </div>
        )}

        <Field label="Nama Lengkap">
          <input
            name="nama"
            type="text"
            required
            placeholder="cth: Budi Santoso"
            className="w-full rounded-[8px] border border-border bg-bg2 px-3 py-2.5 text-[13.5px] text-text placeholder:text-text-dim focus:border-border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
          />
        </Field>

        <Field label="Email">
          <input
            name="email"
            type="email"
            required
            placeholder="cth: budi@terang.com"
            className="w-full rounded-[8px] border border-border bg-bg2 px-3 py-2.5 text-[13.5px] text-text placeholder:text-text-dim focus:border-border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
          />
        </Field>

        <Field label="Password">
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Minimal 6 karakter"
            className="w-full rounded-[8px] border border-border bg-bg2 px-3 py-2.5 text-[13.5px] text-text placeholder:text-text-dim focus:border-border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
          />
        </Field>

        <Field label="Gaji Pokok (Rp)">
          <input
            name="gaji_pokok"
            type="number"
            required
            min={0}
            step={50000}
            placeholder="cth: 2000000"
            className="w-full rounded-[8px] border border-border bg-bg2 px-3 py-2.5 text-[13.5px] text-text placeholder:text-text-dim focus:border-border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
          />
        </Field>

        <button
          type="submit"
          disabled={isPending}
          className="mt-1 rounded-[8px] bg-sage py-3 text-[13.5px] font-semibold text-white transition-opacity disabled:opacity-70 active:opacity-80"
        >
          {isPending ? "Membuat akun..." : "Simpan Anggota"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
        {label}
      </label>
      {children}
    </div>
  );
}
