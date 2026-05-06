"use client";

import { useState, useTransition } from "react";
import { createResi, assignResi } from "@/actions/resi";
import { createClient } from "@/utils/supabase/client";
import type { Profile, ResiStatus } from "@/lib/types";

export function UploadResiForm({ karyawanList }: { karyawanList: Profile[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("pdf") as HTMLInputElement;
    const file = fileInput.files?.[0];
    const assignedTo = (form.elements.namedItem("assigned_to") as HTMLSelectElement).value;

    if (!file) {
      setError("Pilih file PDF terlebih dahulu");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("File harus berformat PDF");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const storagePath = `resi/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

    const { error: uploadError } = await supabase.storage
      .from("resi-pdf")
      .upload(storagePath, file, { contentType: "application/pdf" });

    setUploading(false);

    if (uploadError) {
      setError("Gagal upload PDF: " + uploadError.message);
      return;
    }

    const fd = new FormData();
    fd.set("filename", file.name);
    fd.set("storage_path", storagePath);
    if (assignedTo) fd.set("assigned_to", assignedTo);

    startTransition(async () => {
      const result = await createResi(fd);
      if (!result.success) {
        setError(result.error);
        await supabase.storage.from("resi-pdf").remove([storagePath]);
        return;
      }
      setSuccess(true);
      form.reset();
      setFileName(null);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-[8px] border border-danger-soft bg-danger-soft px-4 py-3 text-[13px] font-medium text-danger">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-[8px] border border-sage-soft bg-sage-soft px-4 py-3 text-[13px] font-medium text-sage">
          Resi berhasil diupload
        </div>
      )}

      {/* File input */}
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
          File PDF Resi
        </label>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-[8px] border-2 border-dashed border-border px-4 py-5 text-center transition-colors hover:border-border-sage hover:bg-bg2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B887D" strokeWidth="1.5" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6M12 18v-6M9 15l3-3 3 3" />
          </svg>
          <div>
            <p className="text-[13px] font-medium text-text">
              {fileName ?? "Tap untuk pilih PDF"}
            </p>
            <p className="text-[11px] text-text-dim">Shopee / TikTok resi</p>
          </div>
          <input
            name="pdf"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </label>
      </div>

      {/* Assign to */}
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
          Assign ke Karyawan (opsional)
        </label>
        <div className="relative">
          <select
            name="assigned_to"
            className="w-full appearance-none rounded-[8px] border border-border bg-bg2 py-3 pl-4 pr-10 text-[14px] text-text focus:border-border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
          >
            <option value="">— Pilih karyawan —</option>
            {karyawanList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B887D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || uploading}
        className="flex items-center justify-center gap-2 rounded-[8px] bg-sage py-3.5 text-[14px] font-semibold text-white transition-opacity disabled:opacity-70 active:opacity-80"
      >
        {uploading ? "Mengupload PDF..." : isPending ? "Menyimpan..." : "Upload Resi"}
      </button>
    </form>
  );
}
