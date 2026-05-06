"use client";

import { useState, useTransition } from "react";
import {
  createSopTemplate,
  createSopItem,
  deleteSopTemplate,
  deleteSopItem,
  upsertSopDailyAssignment,
} from "@/actions/sop";
import type { Profile, SopTemplate, SopItem } from "@/lib/types";

type TemplateWithItems = SopTemplate & { sop_items: SopItem[] };

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function AddItemForm({ templateId, nextUrutan, onAdded }: { templateId: string; nextUrutan: number; onAdded: (item: SopItem) => void }) {
  const [isPending, startTransition] = useTransition();
  const [val, setVal] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!val.trim() || isPending) return;
    const fd = new FormData();
    fd.set("template_id", templateId);
    fd.set("teks_item", val.trim());
    fd.set("urutan", String(nextUrutan));
    startTransition(async () => {
      const result = await createSopItem(fd);
      if (result.success) {
        onAdded(result.data);
        setVal("");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 px-4 py-2 border-t border-border">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Tambah item SOP..."
        className="flex-1 rounded-[6px] border border-border bg-bg2 px-3 py-2 text-[12.5px] text-text placeholder:text-text-mute focus:outline-none focus:ring-1 focus:ring-sage/40"
        disabled={isPending}
      />
      <button
        type="submit"
        disabled={isPending || !val.trim()}
        className="flex items-center gap-1 rounded-[6px] bg-sage px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-50"
      >
        <PlusIcon />
      </button>
    </form>
  );
}

function AssignDropdown({
  templateId,
  anggotaList,
  assignedKaryawanId,
  today,
}: {
  templateId: string;
  anggotaList: Profile[];
  assignedKaryawanId: string | null;
  today: string;
}) {
  const [current, setCurrent] = useState(assignedKaryawanId);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value || null;
    setCurrent(val);
    startTransition(async () => {
      await upsertSopDailyAssignment(templateId, val, today);
    });
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-t border-border bg-bg2/60">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-text-dim flex-shrink-0">
        Hari ini
      </span>
      <div className="relative flex-1">
        <select
          value={current ?? ""}
          onChange={handleChange}
          disabled={isPending}
          className="w-full appearance-none rounded-[6px] border border-border bg-bg px-3 py-1.5 pr-7 text-[12.5px] text-text focus:outline-none focus:ring-1 focus:ring-sage/40 disabled:opacity-60"
        >
          <option value="">— Belum ditugaskan —</option>
          {anggotaList.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nama}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-dim">
          <ChevronIcon />
        </span>
      </div>
      {isPending && (
        <span className="font-mono text-[10px] text-sage flex-shrink-0">menyimpan...</span>
      )}
    </div>
  );
}

function SopCard({
  template,
  anggotaList,
  assignedKaryawanId,
  today,
  onDelete,
}: {
  template: TemplateWithItems;
  anggotaList: Profile[];
  assignedKaryawanId: string | null;
  today: string;
  onDelete: (id: string) => void;
}) {
  const [items, setItems] = useState<SopItem[]>(
    [...template.sop_items].sort((a, b) => a.urutan - b.urutan)
  );
  const [isPending, startTransition] = useTransition();

  function handleDeleteTemplate() {
    if (!confirm(`Hapus SOP "${template.nama_sop}"? Semua item akan ikut terhapus.`)) return;
    startTransition(async () => {
      const result = await deleteSopTemplate(template.id);
      if (result.success) onDelete(template.id);
    });
  }

  function handleDeleteItem(itemId: string) {
    startTransition(async () => {
      const result = await deleteSopItem(itemId);
      if (result.success) setItems((prev) => prev.filter((i) => i.id !== itemId));
    });
  }

  return (
    <div className="rounded-[10px] border border-border bg-surface overflow-hidden">
      {/* Template header */}
      <div className="flex items-start justify-between px-4 py-3 bg-bg2" style={{ borderBottom: "1px solid #E8E3D8" }}>
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-semibold text-text">{template.nama_sop}</p>
          {template.sub_judul && (
            <p className="mt-0.5 text-[11.5px] font-medium text-sage">{template.sub_judul}</p>
          )}
          {template.deskripsi && (
            <p className="mt-0.5 text-[11px] text-text-dim leading-relaxed">{template.deskripsi}</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          <span className="font-mono text-[10px] text-text-dim">{items.length} item</span>
          <button
            onClick={handleDeleteTemplate}
            disabled={isPending}
            className="flex h-6 w-6 items-center justify-center rounded-[5px] text-danger hover:bg-danger-soft disabled:opacity-50"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Daily assignment dropdown */}
      <AssignDropdown
        templateId={template.id}
        anggotaList={anggotaList}
        assignedKaryawanId={assignedKaryawanId}
        today={today}
      />

      {/* Items */}
      {items.map((item, i) => (
        <div
          key={item.id}
          className="flex items-center gap-3 px-4 py-2.5"
          style={{ borderBottom: i < items.length - 1 ? "1px solid #E8E3D8" : "none" }}
        >
          <span className="font-mono text-[11px] font-semibold text-text-mute w-5 text-right flex-shrink-0">
            {item.urutan}.
          </span>
          <p className="flex-1 text-[13px] text-text">{item.teks_item}</p>
          <button
            onClick={() => handleDeleteItem(item.id)}
            disabled={isPending}
            className="flex h-5 w-5 items-center justify-center rounded-[4px] text-text-dim hover:text-danger disabled:opacity-50"
          >
            <TrashIcon />
          </button>
        </div>
      ))}

      {/* Add item */}
      <AddItemForm
        templateId={template.id}
        nextUrutan={items.length + 1}
        onAdded={(item) => setItems((prev) => [...prev, item])}
      />
    </div>
  );
}

export function SopManager({
  karyawanList,
  initialTemplates,
  todayAssignments,
  today,
}: {
  karyawanList: Profile[];
  initialTemplates: TemplateWithItems[];
  todayAssignments: { template_id: string; karyawan_id: string }[];
  today: string;
}) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const assignmentMap = Object.fromEntries(
    todayAssignments.map((a) => [a.template_id, a.karyawan_id])
  );

  function handleCreateTemplate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createSopTemplate(fd);
      if (!result.success) {
        setError(result.error);
        return;
      }
      const newTemplate: TemplateWithItems = {
        ...result.data,
        sop_items: [],
      } as any;
      setTemplates((prev) => [...prev, newTemplate]);
      (e.target as HTMLFormElement).reset();
      setOpen(false);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Create template */}
      <div className="mx-5">
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-border-sage bg-sage py-3 text-[13.5px] font-semibold text-white transition-opacity active:opacity-80"
          >
            <PlusIcon /> Buat SOP
          </button>
        ) : (
          <div className="rounded-[10px] border border-border bg-surface p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13.5px] font-semibold text-text">Buat SOP Baru</p>
              <button
                onClick={() => { setOpen(false); setError(null); }}
                className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-border text-text-dim"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            {error && (
              <div className="mb-3 rounded-[8px] bg-danger-soft px-3 py-2 text-[12.5px] font-medium text-danger">{error}</div>
            )}
            <form onSubmit={handleCreateTemplate} className="flex flex-col gap-2">
              <input
                name="nama_sop"
                required
                placeholder="Judul SOP (misal: SOP Pagi)"
                className="rounded-[8px] border border-border bg-bg2 px-3 py-2.5 text-[13px] text-text placeholder:text-text-mute focus:outline-none focus:ring-2 focus:ring-sage/20"
                disabled={isPending}
              />
              <input
                name="sub_judul"
                placeholder="Sub-judul (misal: Pembukaan Toko) — opsional"
                className="rounded-[8px] border border-border bg-bg2 px-3 py-2.5 text-[13px] text-text placeholder:text-text-mute focus:outline-none focus:ring-2 focus:ring-sage/20"
                disabled={isPending}
              />
              <textarea
                name="deskripsi"
                placeholder="Deskripsi singkat — opsional"
                rows={2}
                className="rounded-[8px] border border-border bg-bg2 px-3 py-2.5 text-[13px] text-text placeholder:text-text-mute focus:outline-none focus:ring-2 focus:ring-sage/20 resize-none"
                disabled={isPending}
              />
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center justify-center gap-1 rounded-[8px] bg-sage px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
              >
                <PlusIcon /> Simpan SOP
              </button>
            </form>
          </div>
        )}
      </div>

      {/* SOP list */}
      <div className="mx-5 flex flex-col gap-3">
        {templates.length === 0 ? (
          <div className="rounded-[10px] border border-border bg-surface px-4 py-8 text-center">
            <p className="text-[13px] text-text-dim">Belum ada SOP dibuat</p>
          </div>
        ) : (
          templates.map((t) => (
            <SopCard
              key={t.id}
              template={t}
              anggotaList={karyawanList}
              assignedKaryawanId={assignmentMap[t.id] ?? t.karyawan_id ?? null}
              today={today}
              onDelete={(id) => setTemplates((prev) => prev.filter((x) => x.id !== id))}
            />
          ))
        )}
      </div>
    </div>
  );
}
