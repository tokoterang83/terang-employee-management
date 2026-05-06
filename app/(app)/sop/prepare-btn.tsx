"use client";

import { useState, useTransition } from "react";
import { prepareAllChecklists } from "@/actions/checklist";

export function PrepareChecklistBtn({ today }: { today: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  function handleClick() {
    if (!confirm("Siapkan checklist hari ini untuk semua anggota?\n\nIni akan reset dan isi ulang checklist berdasarkan SOP yang sudah di-assign.")) return;
    setResult(null);
    startTransition(async () => {
      const res = await prepareAllChecklists(today);
      if (res.success) {
        setResult({ ok: true, msg: `${res.data.count} anggota siap` });
      } else {
        setResult({ ok: false, msg: res.error });
      }
    });
  }

  return (
    <div className="mx-5">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-sage bg-sage/10 py-3 text-[13.5px] font-semibold text-sage transition-opacity active:opacity-70 disabled:opacity-50"
      >
        {isPending ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-sage border-t-transparent" />
            Menyiapkan...
          </>
        ) : (
          <>
            <CheckIcon />
            Siapkan Checklist Hari Ini
          </>
        )}
      </button>
      {result && (
        <p
          className="mt-2 text-center text-[12.5px] font-medium"
          style={{ color: result.ok ? "#586D57" : "#9C4A3A" }}
        >
          {result.ok ? `✓ ${result.msg}` : `✗ ${result.msg}`}
        </p>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
