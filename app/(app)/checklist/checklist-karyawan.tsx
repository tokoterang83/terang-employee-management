"use client";

import { useTransition, useState } from "react";
import { toggleChecklistItem } from "@/actions/checklist";
import type { ChecklistItem } from "@/lib/types";

type ItemWithSop = ChecklistItem & {
  sop_items: { teks_item: string; urutan: number } | null;
};

type Props = {
  checklistId: string;
  items: ItemWithSop[];
  isVerified: boolean;
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

function Tag({ color, bg, label }: { color: string; bg: string; label: string }) {
  return (
    <span
      className="inline-flex items-center rounded-[4px] font-mono text-[10.5px] font-medium px-1.5 py-0.5"
      style={{ color, background: bg }}
    >
      {label}
    </span>
  );
}

function ChecklistRow({
  item,
  isVerified: parentVerified,
}: {
  item: ItemWithSop;
  isVerified: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticChecked, setOptimisticChecked] = useState(item.is_checked);

  const isVerif = item.is_verified === true;
  const isRejected = item.is_verified === false;
  const isChecked = optimisticChecked;
  const isDone = isVerif || isChecked;

  function toggle() {
    if (parentVerified || isVerif || isRejected || isPending) return;
    const next = !optimisticChecked;
    setOptimisticChecked(next);
    const fd = new FormData();
    fd.set("checklist_item_id", item.id);
    fd.set("is_checked", String(next));
    startTransition(async () => {
      const result = await toggleChecklistItem(fd);
      if (!result.success) {
        setOptimisticChecked(!next);
      }
    });
  }

  return (
    <div
      className="flex items-start gap-3 px-4 py-3"
      style={{
        background: isRejected ? "rgba(239,217,210,0.3)" : "transparent",
        borderBottom: "1px solid #E8E3D8",
      }}
    >
      {/* Checkbox */}
      <button
        onClick={toggle}
        disabled={parentVerified || isVerif || isRejected || isPending}
        className="mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-colors disabled:cursor-default"
        style={{
          background: isDone && !isRejected ? "#586D57" : isRejected ? "#fff" : "#EFEBE2",
          borderColor: isDone && !isRejected ? "#586D57" : isRejected ? "#9C4A3A" : "#DDD7C8",
        }}
      >
        {isDone && !isRejected && <CheckIcon />}
        {isRejected && <XIcon />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className="text-[13.5px] font-medium"
          style={{
            color: isDone && !isRejected ? "#5C5A52" : "#2B362B",
            textDecoration: isVerif ? "line-through" : "none",
            textDecorationColor: "#B5B1A4",
          }}
        >
          {item.sop_items?.teks_item ?? "Item SOP"}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {isVerif && <Tag color="#586D57" bg="#E8EBE5" label="Terverifikasi" />}
          {isRejected && <Tag color="#9C4A3A" bg="#EFD9D2" label="Ditolak Mas Arya/Mbak Syafira" />}
          {isChecked && !isVerif && !isRejected && (
            <Tag color="#4A6B8C" bg="#D9E2EC" label="Menunggu verifikasi" />
          )}
          {!isChecked && !isVerif && !isRejected && (
            <Tag color="#8B887D" bg="#EFEBE2" label="Belum dikerjakan" />
          )}
        </div>
      </div>

      <span
        className="mt-0.5 flex-shrink-0 rounded-[4px] font-mono text-[11px] font-semibold px-1.5 py-0.5"
        style={{
          background: isRejected ? "#EFD9D2" : "#E8EBE5",
          color: isRejected ? "#9C4A3A" : "#586D57",
        }}
      >
        {isRejected ? "-1" : "+1"}
      </span>
    </div>
  );
}

export function ChecklistKaryawan({ checklistId, items, isVerified }: Props) {
  const sorted = [...items].sort(
    (a, b) => (a.sop_items?.urutan ?? 0) - (b.sop_items?.urutan ?? 0)
  );

  const verified = sorted.filter((i) => i.is_verified === true).length;
  const rejected = sorted.filter((i) => i.is_verified === false).length;
  const waiting = sorted.filter((i) => i.is_checked && i.is_verified === null).length;
  const done = sorted.filter((i) => i.is_checked || i.is_verified === true).length;
  const total = sorted.length;
  const pct = total > 0 ? done / total : 0;

  return (
    <div>
      {/* Progress card */}
      <div className="mx-5 rounded-[10px] border border-border bg-surface p-4">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
              Progres
            </p>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="font-mono text-[28px] font-semibold leading-none tracking-tight text-text">
                {done}/{total}
              </span>
              <span className="text-[12px] font-medium text-text-dim">
                {Math.round(pct * 100)}%
              </span>
            </div>
          </div>
          {isVerified && (
            <span className="rounded-[6px] bg-sage px-2.5 py-1 font-mono text-[10.5px] font-semibold text-white">
              Terverifikasi
            </span>
          )}
        </div>

        {/* Segmented bar */}
        <div className="mb-2.5 flex h-1.5 gap-0.5 overflow-hidden rounded-full">
          {sorted.map((item) => {
            const color =
              item.is_verified === true
                ? "#586D57"
                : item.is_verified === false
                ? "#9C4A3A"
                : item.is_checked
                ? "#D5DCD2"
                : "#EFEBE2";
            return (
              <div
                key={item.id}
                className="flex-1 rounded-[2px]"
                style={{ background: color }}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-[11px] font-medium text-text-sec">
          <LegendDot color="#586D57" label={`${verified} terverifikasi`} />
          <LegendDot color="#D5DCD2" label={`${waiting} menunggu`} />
          <LegendDot color="#9C4A3A" label={`${rejected} ditolak`} />
        </div>
      </div>

      {/* Item list */}
      <div className="mx-5 mt-3 overflow-hidden rounded-[10px] border border-border bg-surface">
        {sorted.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] text-text-dim">
            Belum ada item SOP
          </div>
        ) : (
          sorted.map((item, i) => (
            <div
              key={item.id}
              style={{ borderBottom: i < sorted.length - 1 ? "" : "none" }}
            >
              <ChecklistRow item={item} isVerified={isVerified} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-[7px] w-[7px] rounded-[2px]" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}
