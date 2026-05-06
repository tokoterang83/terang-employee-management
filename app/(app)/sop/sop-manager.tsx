"use client";

import { useState, useTransition } from "react";
import {
  createSopTemplate,
  createSopItem,
  deleteSopTemplate,
  deleteSopItem,
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

function SopCard({
  template,
  onDelete,
}: {
  template: TemplateWithItems;
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
}: {
  karyawanList: Profile[];
  initialTemplates: (TemplateWithItems & { karyawan_id: string })[];
}) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedKaryawan, setSelectedKaryawan] = useState(karyawanList[0]?.id ?? "");

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
      const newTemplate: TemplateWithItems & { karyawan_id: string } = {
        ...result.data,
        sop_items: [],
      } as any;
      setTemplates((prev) => [...prev, newTemplate]);
      (e.target as HTMLFormElement).reset();
    });
  }

  const filteredTemplates = templates.filter((t) => t.karyawan_id === selectedKaryawan);

  return (
    <div className="flex flex-col gap-4">
      {/* Anggota selector */}
      <div className="mx-5">
        <p className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
          Pilih Anggota
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {karyawanList.map((k) => (
            <button
              key={k.id}
              onClick={() => setSelectedKaryawan(k.id)}
              className="flex-shrink-0 rounded-[8px] px-3 py-1.5 text-[12.5px] font-semibold transition-colors"
              style={{
                background: selectedKaryawan === k.id ? "#586D57" : "#F4F1EA",
                color: selectedKaryawan === k.id ? "#fff" : "#2B362B",
                border: `1px solid ${selectedKaryawan === k.id ? "#586D57" : "#E8E3D8"}`,
              }}
            >
              {k.nama.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Create template form */}
      <div className="mx-5 rounded-[10px] border border-border bg-surface p-4">
        <p className="mb-3 text-[13.5px] font-semibold text-text">Buat SOP Baru</p>
        {error && (
          <div className="mb-3 rounded-[8px] bg-danger-soft px-3 py-2 text-[12.5px] font-medium text-danger">{error}</div>
        )}
        <form onSubmit={handleCreateTemplate} className="flex flex-col gap-2">
          <input type="hidden" name="karyawan_id" value={selectedKaryawan} />
          <input
            name="nama_sop"
            required
            placeholder="Judul SOP (misal: SOP Pagi)"
            className="rounded-[8px] border border-border bg-bg2 px-3 py-2.5 text-[13px] text-text placeholder:text-text-mute focus:outline-none focus:ring-2 focus:ring-sage/20"
            disabled={isPending || !selectedKaryawan}
          />
          <input
            name="sub_judul"
            placeholder="Sub-judul (misal: Pembukaan Toko) — opsional"
            className="rounded-[8px] border border-border bg-bg2 px-3 py-2.5 text-[13px] text-text placeholder:text-text-mute focus:outline-none focus:ring-2 focus:ring-sage/20"
            disabled={isPending || !selectedKaryawan}
          />
          <textarea
            name="deskripsi"
            placeholder="Deskripsi singkat — opsional"
            rows={2}
            className="rounded-[8px] border border-border bg-bg2 px-3 py-2.5 text-[13px] text-text placeholder:text-text-mute focus:outline-none focus:ring-2 focus:ring-sage/20 resize-none"
            disabled={isPending || !selectedKaryawan}
          />
          <button
            type="submit"
            disabled={isPending || !selectedKaryawan}
            className="flex items-center justify-center gap-1 rounded-[8px] bg-sage px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
          >
            <PlusIcon /> Buat SOP
          </button>
        </form>
      </div>

      {/* SOP list */}
      <div className="mx-5 flex flex-col gap-3">
        {filteredTemplates.length === 0 ? (
          <div className="rounded-[10px] border border-border bg-surface px-4 py-8 text-center">
            <p className="text-[13px] text-text-dim">
              {karyawanList.length === 0
                ? "Belum ada anggota terdaftar"
                : "Belum ada SOP untuk anggota ini"}
            </p>
          </div>
        ) : (
          filteredTemplates.map((t) => (
            <SopCard
              key={t.id}
              template={t}
              onDelete={(id) => setTemplates((prev) => prev.filter((x) => x.id !== id))}
            />
          ))
        )}
      </div>
    </div>
  );
}
