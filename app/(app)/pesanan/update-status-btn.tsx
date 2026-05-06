"use client";

import { useTransition, useState } from "react";
import { updatePesananStatus } from "@/actions/pesanan";
import type { PesananStatus } from "@/lib/types";

const STATUS_ORDER: PesananStatus[] = ["Diterima", "Diproses", "Siap", "Selesai"];

export function UpdateStatusBtn({
  pesananId,
  currentStatus,
}: {
  pesananId: string;
  currentStatus: PesananStatus;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  const idx = STATUS_ORDER.indexOf(status);
  const next = idx < STATUS_ORDER.length - 1 ? STATUS_ORDER[idx + 1] : null;

  if (!next) return null;

  function handleUpdate() {
    if (!next || isPending) return;
    const prev = status;
    setStatus(next);
    const fd = new FormData();
    fd.set("pesanan_id", pesananId);
    fd.set("status", next);
    startTransition(async () => {
      const result = await updatePesananStatus(fd);
      if (!result.success) setStatus(prev);
    });
  }

  return (
    <button
      onClick={handleUpdate}
      disabled={isPending}
      className="rounded-[7px] bg-sage px-2.5 py-1 font-mono text-[10.5px] font-semibold text-white transition-opacity disabled:opacity-60 active:opacity-80"
    >
      {isPending ? "..." : `→ ${next}`}
    </button>
  );
}
