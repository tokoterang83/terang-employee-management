"use client";

import { useTransition, useState, useOptimistic } from "react";
import { verifyChecklistItem, finalizeChecklistVerification } from "@/actions/checklist";
import type { ChecklistDaily, ChecklistItem, VerifStatus } from "@/lib/types";

type ItemWithSop = ChecklistItem & {
  sop_items: { teks_item: string; urutan: number } | null;
};

type ChecklistWithProfile = ChecklistDaily & {
  profiles: { nama: string } | null;
  checklist_items: ItemWithSop[];
};

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l5 5L20 7" />
    </svg>
  );
}

function XIcon({ color = "#9C4A3A" }: { color?: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function VerifRow({ item }: { item: ItemWithSop }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticVerif, setOptimisticVerif] = useState<boolean | null>(item.is_verified ?? null);

  if (!item.is_checked) return null;

  function verify(val: boolean) {
    if (isPending) return;
    setOptimisticVerif(val);
    const fd = new FormData();
    fd.set("checklist_item_id", item.id);
    fd.set("is_verified", String(val));
    startTransition(async () => {
      const result = await verifyChecklistItem(fd);
      if (!result.success) {
        setOptimisticVerif(item.is_verified ?? null);
      }
    });
  }

  const isVerif = optimisticVerif === true;
  const isRejected = optimisticVerif === false;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{
        borderBottom: "1px solid #E8E3D8",
        background: isRejected ? "rgba(239,217,210,0.3)" : "transparent",
      }}
    >
      {/* State indicator */}
      <div
        className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] border-[1.5px]"
        style={{
          background: isVerif ? "#586D57" : isRejected ? "#fff" : "#EFEBE2",
          borderColor: isVerif ? "#586D57" : isRejected ? "#9C4A3A" : "#DDD7C8",
        }}
      >
        {isVerif && <CheckIcon />}
        {isRejected && <XIcon />}
      </div>

      <p className="flex-1 text-[13px] font-medium text-text" style={{ textDecoration: isVerif ? "line-through" : "none", textDecorationColor: "#B5B1A4" }}>
        {item.sop_items?.teks_item}
      </p>

      {/* Action buttons */}
      {!isVerif && !isRejected ? (
        <div className="flex gap-1.5">
          <button
            onClick={() => verify(true)}
            disabled={isPending}
            className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-sage transition-opacity disabled:opacity-60 active:opacity-80"
          >
            <CheckIcon />
          </button>
          <button
            onClick={() => verify(false)}
            disabled={isPending}
            className="flex h-7 w-7 items-center justify-center rounded-[5px] border border-border bg-bg2 transition-opacity disabled:opacity-60 active:opacity-80"
          >
            <XIcon />
          </button>
        </div>
      ) : (
        <div className="flex gap-1.5">
          {isVerif && (
            <button
              onClick={() => verify(false)}
              disabled={isPending}
              className="rounded-[4px] px-2 py-0.5 font-mono text-[10px] font-semibold text-sage bg-sage-soft disabled:opacity-60"
            >
              Batalkan
            </button>
          )}
          {isRejected && (
            <button
              onClick={() => verify(true)}
              disabled={isPending}
              className="rounded-[4px] px-2 py-0.5 font-mono text-[10px] font-semibold text-danger bg-danger-soft disabled:opacity-60"
            >
              Batalkan
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function KaryawanChecklist({ checklist }: { checklist: ChecklistWithProfile }) {
  const [isPending, startTransition] = useTransition();
  const [finalized, setFinalized] = useState(checklist.status_verif === "verified");

  const items = [...checklist.checklist_items].sort(
    (a, b) => (a.sop_items?.urutan ?? 0) - (b.sop_items?.urutan ?? 0)
  );
  const checkedItems = items.filter((i) => i.is_checked);
  const verifiedCount = checkedItems.filter((i) => i.is_verified === true).length;
  const rejectedCount = checkedItems.filter((i) => i.is_verified === false).length;
  const pendingCount = checkedItems.filter((i) => i.is_verified === null).length;

  function handleFinalize() {
    if (isPending || finalized) return;
    startTransition(async () => {
      const result = await finalizeChecklistVerification(checklist.id);
      if (result.success) setFinalized(true);
    });
  }

  const nama = checklist.profiles?.nama ?? "Karyawan";

  return (
    <div className="rounded-[10px] border border-border bg-surface overflow-hidden">
      {/* Header karyawan */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid #E8E3D8", background: "#F4F1EA" }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-sage flex-shrink-0">
          <span className="font-mono text-[11px] font-semibold text-white">
            {nama.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <p className="text-[13.5px] font-semibold text-text">{nama}</p>
          <p className="text-[11px] text-text-dim">
            {checkedItems.length}/{items.length} tugas dicentang
          </p>
        </div>
        <div className="flex gap-1">
          {pendingCount > 0 && (
            <span className="rounded-[4px] bg-sage px-2 py-0.5 font-mono text-[10px] font-semibold text-white">
              {pendingCount} pending
            </span>
          )}
          {finalized && (
            <span className="rounded-[4px] bg-sage-soft px-2 py-0.5 font-mono text-[10px] font-semibold text-sage">
              Selesai
            </span>
          )}
        </div>
      </div>

      {/* Items */}
      {checkedItems.length === 0 ? (
        <div className="px-4 py-5 text-center text-[12.5px] text-text-dim">
          Karyawan belum mencentang item apapun
        </div>
      ) : (
        checkedItems.map((item) => <VerifRow key={item.id} item={item} />)
      )}

      {/* Finalize button */}
      {!finalized && checkedItems.length > 0 && (
        <div className="border-t border-border px-4 py-3">
          <button
            onClick={handleFinalize}
            disabled={isPending || pendingCount > 0}
            className="w-full rounded-[8px] bg-sage py-2.5 font-mono text-[12px] font-semibold text-white transition-opacity disabled:opacity-50 active:opacity-80"
          >
            {isPending
              ? "Menyimpan..."
              : pendingCount > 0
              ? `${pendingCount} item belum diverifikasi`
              : "Selesaikan Verifikasi (+/-poin)"}
          </button>
        </div>
      )}
    </div>
  );
}

export function VerifikasiOwner({ checklists }: { checklists: ChecklistWithProfile[] }) {
  if (checklists.length === 0) {
    return (
      <div className="mx-5 rounded-[10px] border border-border bg-surface px-4 py-8 text-center">
        <p className="text-[13px] text-text-dim">Belum ada karyawan yang membuat checklist hari ini</p>
      </div>
    );
  }

  return (
    <div className="mx-5 flex flex-col gap-3">
      {checklists.map((c) => (
        <KaryawanChecklist key={c.id} checklist={c} />
      ))}
    </div>
  );
}
