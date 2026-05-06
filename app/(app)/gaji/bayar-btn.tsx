"use client";

import { useTransition, useState } from "react";
import { bayarGaji } from "@/actions/gaji";

export function BayarBtn({ gajiId }: { gajiId: string }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <span className="rounded-[6px] bg-sage-soft font-mono text-[11px] font-semibold text-sage px-2.5 py-1">
        Sudah Bayar ✓
      </span>
    );
  }

  function handleBayar() {
    if (isPending) return;
    const fd = new FormData();
    fd.set("gaji_id", gajiId);
    startTransition(async () => {
      const result = await bayarGaji(fd);
      if (result.success) setDone(true);
    });
  }

  return (
    <button
      onClick={handleBayar}
      disabled={isPending}
      className="rounded-[6px] bg-sage px-2.5 py-1 font-mono text-[11px] font-semibold text-white transition-opacity disabled:opacity-60 active:opacity-80"
    >
      {isPending ? "..." : "Tandai Bayar"}
    </button>
  );
}
