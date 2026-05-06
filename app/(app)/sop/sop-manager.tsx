"use client";

import { useState, useTransition } from "react";
import {
  createSopTemplate,
  createSopItem,
  deleteSopTemplate,
  deleteSopItem,
  assignSopsToKaryawan,
  getAssignmentsByKaryawan,
} from "@/actions/sop";
import type { Profile, SopTemplate, SopItem } from "@/lib/types";

type TemplateWithItems = SopTemplate & { sop_items: SopItem[] };

// ── Icons ───────────────────────────────────────────────
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
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// ── Library Tab ─────────────────────────────────────────
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
      if (result.success) { onAdded(result.data); setVal(""); }
    });
  }
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 px-4 py-2 border-t border-border">
      <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Tambah item SOP..." disabled={isPending}
        className="flex-1 rounded-[6px] border border-border bg-bg2 px-3 py-2 text-[12.5px] text-text placeholder:text-text-mute focus:outline-none focus:ring-1 focus:ring-sage/40" />
      <button type="submit" disabled={isPending || !val.trim()}
        className="flex items-center gap-1 rounded-[6px] bg-sage px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-50">
        <PlusIcon />
      </button>
    </form>
  );
}

function SopCard({ template, onDelete }: { template: TemplateWithItems; onDelete: (id: string) => void }) {
  const [items, setItems] = useState<SopItem[]>([...template.sop_items].sort((a, b) => a.urutan - b.urutan));
  const [expanded, setExpanded] = useState(true);
  const [isPending, startTransition] = useTransition();

  function handleDeleteTemplate() {
    if (!confirm(`Hapus SOP "${template.nama_sop}"? Semua item ikut terhapus.`)) return;
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
      <div className="flex items-start justify-between px-4 py-3 bg-bg2" style={{ borderBottom: "1px solid #E8E3D8" }}>
        <button className="flex-1 min-w-0 text-left" onClick={() => setExpanded((v) => !v)}>
          <div className="flex items-center gap-2">
            <p className="text-[13.5px] font-semibold text-text">{template.nama_sop}</p>
            <ChevronIcon open={expanded} />
          </div>
          {template.sub_judul && <p className="mt-0.5 text-[11.5px] font-medium text-sage">{template.sub_judul}</p>}
          {template.deskripsi && <p className="mt-0.5 text-[11px] text-text-dim">{template.deskripsi}</p>}
        </button>
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          <span className="font-mono text-[10px] text-text-dim">{items.length} item</span>
          <button onClick={handleDeleteTemplate} disabled={isPending}
            className="flex h-6 w-6 items-center justify-center rounded-[5px] text-danger hover:bg-danger-soft disabled:opacity-50">
            <TrashIcon />
          </button>
        </div>
      </div>
      {expanded && (
        <>
          {items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: i < items.length - 1 ? "1px solid #E8E3D8" : "none" }}>
              <span className="font-mono text-[11px] font-semibold text-text-mute w-5 text-right flex-shrink-0">{item.urutan}.</span>
              <p className="flex-1 text-[13px] text-text">{item.teks_item}</p>
              <button onClick={() => handleDeleteItem(item.id)} disabled={isPending}
                className="flex h-5 w-5 items-center justify-center rounded-[4px] text-text-dim hover:text-danger disabled:opacity-50">
                <TrashIcon />
              </button>
            </div>
          ))}
          <AddItemForm templateId={template.id} nextUrutan={items.length + 1} onAdded={(item) => setItems((prev) => [...prev, item])} />
        </>
      )}
    </div>
  );
}

function LibraryTab({ initialTemplates }: { initialTemplates: TemplateWithItems[] }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createSopTemplate(fd);
      if (!result.success) { setError(result.error); return; }
      setTemplates((prev) => [...prev, { ...result.data, sop_items: [] } as any]);
      (e.target as HTMLFormElement).reset();
      setOpen(false);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Form buat SOP */}
      {!open ? (
        <button onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-border-sage bg-sage py-3 text-[13.5px] font-semibold text-white transition-opacity active:opacity-80">
          <PlusIcon /> Buat SOP Baru
        </button>
      ) : (
        <div className="rounded-[10px] border border-border bg-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13.5px] font-semibold text-text">Buat SOP Baru</p>
            <button onClick={() => { setOpen(false); setError(null); }}
              className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-border text-text-dim">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          {error && <div className="mb-3 rounded-[8px] bg-danger-soft px-3 py-2 text-[12.5px] font-medium text-danger">{error}</div>}
          <form onSubmit={handleCreate} className="flex flex-col gap-2">
            <input name="nama_sop" required placeholder="Judul SOP (misal: SOP Pagi)" disabled={isPending}
              className="rounded-[8px] border border-border bg-bg2 px-3 py-2.5 text-[13px] text-text placeholder:text-text-mute focus:outline-none focus:ring-2 focus:ring-sage/20" />
            <input name="sub_judul" placeholder="Sub-judul (misal: Buka Toko) — opsional" disabled={isPending}
              className="rounded-[8px] border border-border bg-bg2 px-3 py-2.5 text-[13px] text-text placeholder:text-text-mute focus:outline-none focus:ring-2 focus:ring-sage/20" />
            <textarea name="deskripsi" placeholder="Deskripsi singkat — opsional" rows={2} disabled={isPending}
              className="rounded-[8px] border border-border bg-bg2 px-3 py-2.5 text-[13px] text-text placeholder:text-text-mute focus:outline-none focus:ring-2 focus:ring-sage/20 resize-none" />
            <button type="submit" disabled={isPending}
              className="flex items-center justify-center gap-1 rounded-[8px] bg-sage px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50">
              <PlusIcon /> Simpan SOP
            </button>
          </form>
        </div>
      )}

      {/* Daftar SOP */}
      {templates.length === 0 ? (
        <div className="rounded-[10px] border border-border bg-surface px-4 py-8 text-center">
          <p className="text-[13px] text-text-dim">Belum ada SOP dibuat</p>
        </div>
      ) : (
        templates.map((t) => (
          <SopCard key={t.id} template={t} onDelete={(id) => setTemplates((prev) => prev.filter((x) => x.id !== id))} />
        ))
      )}
    </div>
  );
}

// ── Assign Tab ──────────────────────────────────────────
const DATE_OPTIONS = [
  { label: "Hari ini", offset: 0 },
  { label: "Besok", offset: 1 },
  { label: "Lusa", offset: 2 },
];

function getDateStr(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

function AssignTab({ anggotaList, templates }: { anggotaList: Profile[]; templates: TemplateWithItems[] }) {
  const [selectedAnggota, setSelectedAnggota] = useState(anggotaList[0]?.id ?? "");
  const [dateOffset, setDateOffset] = useState(0);
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  function loadAssignments(karyawanId: string, offset: number) {
    const tanggal = getDateStr(offset);
    setLoading(true);
    startTransition(async () => {
      const res = await getAssignmentsByKaryawan(karyawanId, tanggal);
      setSelectedTemplates(new Set(res.success ? res.data : []));
      setLoading(false);
    });
  }

  function handleAnggotaChange(id: string) {
    setSelectedAnggota(id);
    setResult(null);
    loadAssignments(id, dateOffset);
  }

  function handleDateChange(offset: number) {
    setDateOffset(offset);
    setResult(null);
    loadAssignments(selectedAnggota, offset);
  }

  function toggleTemplate(id: string) {
    setSelectedTemplates((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSiapkan() {
    if (!selectedAnggota) return;
    const tanggal = getDateStr(dateOffset);
    setResult(null);
    startTransition(async () => {
      const res = await assignSopsToKaryawan(selectedAnggota, [...selectedTemplates], tanggal);
      setResult(res.success
        ? { ok: true, msg: `${res.data.count} SOP disiapkan untuk ${anggotaList.find((a) => a.id === selectedAnggota)?.nama.split(" ")[0]}` }
        : { ok: false, msg: res.error }
      );
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Pilih anggota */}
      <div>
        <p className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">Pilih Anggota</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {anggotaList.map((a) => (
            <button key={a.id} onClick={() => handleAnggotaChange(a.id)}
              className="flex-shrink-0 rounded-[8px] px-3 py-1.5 text-[12.5px] font-semibold transition-colors"
              style={{
                background: selectedAnggota === a.id ? "#586D57" : "#F4F1EA",
                color: selectedAnggota === a.id ? "#fff" : "#2B362B",
                border: `1px solid ${selectedAnggota === a.id ? "#586D57" : "#E8E3D8"}`,
              }}>
              {a.nama.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Pilih tanggal */}
      <div>
        <p className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">Jadwalkan Untuk</p>
        <div className="flex gap-2">
          {DATE_OPTIONS.map((opt) => (
            <button key={opt.offset} onClick={() => handleDateChange(opt.offset)}
              className="flex-1 rounded-[8px] py-2 text-[12.5px] font-semibold transition-colors"
              style={{
                background: dateOffset === opt.offset ? "#586D57" : "#F4F1EA",
                color: dateOffset === opt.offset ? "#fff" : "#2B362B",
                border: `1px solid ${dateOffset === opt.offset ? "#586D57" : "#E8E3D8"}`,
              }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pilih SOP */}
      <div>
        <p className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
          Pilih SOP {loading && <span className="text-sage normal-case">memuat...</span>}
        </p>
        {templates.length === 0 ? (
          <p className="text-[13px] text-text-dim">Belum ada SOP di library. Buat dulu di tab "Library".</p>
        ) : (
          <div className="flex flex-col gap-2">
            {templates.map((t) => {
              const checked = selectedTemplates.has(t.id);
              return (
                <button key={t.id} onClick={() => toggleTemplate(t.id)}
                  className="flex items-center gap-3 rounded-[10px] border px-4 py-3 text-left transition-colors"
                  style={{
                    background: checked ? "#EEF1ED" : "#FAFAF8",
                    borderColor: checked ? "#586D57" : "#E8E3D8",
                  }}>
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[5px] border-[1.5px]"
                    style={{ background: checked ? "#586D57" : "#fff", borderColor: checked ? "#586D57" : "#DDD7C8" }}>
                    {checked && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12.5l5 5L20 7" /></svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-text">{t.nama_sop}</p>
                    {t.sub_judul && <p className="text-[11.5px] text-sage mt-0.5">{t.sub_judul}</p>}
                    <p className="text-[11px] text-text-dim mt-0.5">{t.sop_items.length} item</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tombol siapkan */}
      <button onClick={handleSiapkan} disabled={isPending || !selectedAnggota}
        className="flex items-center justify-center gap-2 rounded-[10px] bg-sage py-3 text-[13.5px] font-semibold text-white disabled:opacity-50">
        {isPending ? (
          <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Menyiapkan...</>
        ) : (
          <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg> Siapkan</>
        )}
      </button>

      {result && (
        <p className="text-center text-[12.5px] font-medium" style={{ color: result.ok ? "#586D57" : "#9C4A3A" }}>
          {result.ok ? `✓ ${result.msg}` : `✗ ${result.msg}`}
        </p>
      )}
    </div>
  );
}

// ── Main SopManager ─────────────────────────────────────
export function SopManager({
  karyawanList,
  initialTemplates,
}: {
  karyawanList: Profile[];
  initialTemplates: TemplateWithItems[];
}) {
  const [tab, setTab] = useState<"library" | "assign">("assign");

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="mx-5 flex rounded-[10px] border border-border bg-surface p-1 gap-1">
        {(["assign", "library"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 rounded-[8px] py-2 text-[13px] font-semibold transition-colors"
            style={{
              background: tab === t ? "#586D57" : "transparent",
              color: tab === t ? "#fff" : "#5C5A52",
            }}>
            {t === "assign" ? "Tugaskan" : "Library SOP"}
          </button>
        ))}
      </div>

      <div className="mx-5">
        {tab === "library" ? (
          <LibraryTab initialTemplates={initialTemplates} />
        ) : (
          <AssignTab anggotaList={karyawanList} templates={initialTemplates} />
        )}
      </div>
    </div>
  );
}
