"use client";

import { useState, useTransition } from "react";
import { getResiDownloadUrl } from "@/actions/resi";

export function ResiDownloadBtn({ storagePath }: { storagePath: string }) {
  const [isPending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function handleDownload() {
    setFailed(false);
    startTransition(async () => {
      const result = await getResiDownloadUrl(storagePath);
      if (!result.success) { setFailed(true); return; }
      window.open(result.data, "_blank");
    });
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isPending}
      className={`rounded-[7px] border px-3 py-1.5 font-mono text-[11px] font-semibold transition-opacity disabled:opacity-60 active:opacity-80 ${
        failed
          ? "border-danger bg-danger-soft text-danger"
          : "border-border bg-bg2 text-text-sec"
      }`}
    >
      {isPending ? "..." : failed ? "Gagal, coba lagi" : "↓ Download PDF"}
    </button>
  );
}
