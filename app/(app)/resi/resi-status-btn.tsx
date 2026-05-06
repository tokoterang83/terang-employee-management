"use client";

import { useTransition, useState } from "react";
import { updateResiStatus } from "@/actions/resi";
import type { ResiStatus } from "@/lib/types";

const STATUS_ORDER: ResiStatus[] = ["Baru", "Packing", "Siap Kirim", "Terkirim"];

function getNextStatus(current: ResiStatus): ResiStatus | null {
  const idx = STATUS_ORDER.indexOf(current);
  if (idx === -1 || idx === STATUS_ORDER.length - 1) return null;
  return STATUS_ORDER[idx + 1];
}

export function ResiStatusBtn({ resiId, currentStatus }: { resiId: string; currentStatus: ResiStatus }) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const next = getNextStatus(status);

  if (!next) return null;

  function handleUpdate() {
    if (!next || isPending) return;
    const prev = status;
    setStatus(next);
    const fd = new FormData();
    fd.set("resi_id", resiId);
    fd.set("status", next);
    startTransition(async () => {
      const result = await updateResiStatus(fd);
      if (!result.success) setStatus(prev);
    });
  }

  return (
    <button
      onClick={handleUpdate}
      disabled={isPending}
      className="rounded-[7px] bg-sage px-3 py-1.5 font-mono text-[11px] font-semibold text-white transition-opacity disabled:opacity-60 active:opacity-80"
    >
      {isPending ? "..." : `→ ${next}`}
    </button>
  );
}
