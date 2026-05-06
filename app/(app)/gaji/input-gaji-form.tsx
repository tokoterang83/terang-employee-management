"use client";

import { useState, useTransition } from "react";
import { upsertGaji } from "@/actions/gaji";
import type { Profile } from "@/lib/types";

export function InputGajiForm({ karyawanList, bulan, tahun }: { karyawanList: Profile[]; bulan: number; tahun: number }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await upsertGaji(fd);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {error && (
        <div className="rounded-[8px] bg-danger-soft px-3 py-2.5 text-[12.5px] font-medium text-danger">{error}</div>
      )}
      {success && (
        <div className="rounded-[8px] bg-sage-soft px-3 py-2.5 text-[12.5px] font-medium text-sage">Data gaji disimpan</div>
      )}

      <input type="hidden" name="bulan" value={bulan} />
      <input type="hidden" name="tahun" value={tahun} />

      <div className="flex flex-col gap-1">
        <label className="font-mono text-[10px] font-semibold uppercase tracking-wider text-text-dim">Karyawan</label>
        <div className="relative">
          <select
            name="karyawan_id"
            required
            className="w-full appearance-none rounded-[8px] border border-border bg-bg2 py-2.5 pl-3 pr-9 text-[13px] text-text focus:border-border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 disabled:opacity-60"
            disabled={isPending}
          >
            <option value="">— Pilih —</option>
            {karyawanList.map((k) => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8B887D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] font-semibold uppercase tracking-wider text-text-dim">Gaji Pokok</label>
          <input
            name="gaji_pokok"
            type="number"
            required
            min={0}
            placeholder="2500000"
            className="rounded-[8px] border border-border bg-bg2 px-3 py-2.5 text-[13px] text-text focus:outline-none focus:ring-2 focus:ring-sage/20"
            disabled={isPending}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] font-semibold uppercase tracking-wider text-text-dim">Bonus</label>
          <input
            name="bonus"
            type="number"
            min={0}
            defaultValue={0}
            placeholder="0"
            className="rounded-[8px] border border-border bg-bg2 px-3 py-2.5 text-[13px] text-text focus:outline-none focus:ring-2 focus:ring-sage/20"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-mono text-[10px] font-semibold uppercase tracking-wider text-text-dim">Catatan Bonus</label>
        <input
          name="catatan_bonus"
          placeholder="Alasan pemberian bonus..."
          className="rounded-[8px] border border-border bg-bg2 px-3 py-2.5 text-[13px] text-text focus:outline-none focus:ring-2 focus:ring-sage/20"
          disabled={isPending}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-[8px] bg-sage py-2.5 text-[13px] font-semibold text-white transition-opacity disabled:opacity-70"
      >
        {isPending ? "Menyimpan..." : "Simpan Data Gaji"}
      </button>
    </form>
  );
}
