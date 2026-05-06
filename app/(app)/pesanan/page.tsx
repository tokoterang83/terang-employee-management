import { redirect } from "next/navigation";
import { getProfile } from "@/actions/auth";
import { getAllPesanan } from "@/actions/pesanan";
import { BuatPesananForm } from "./buat-pesanan-form";
import { UpdateStatusBtn } from "./update-status-btn";
import type { PesananStatus, PesananJenis } from "@/lib/types";

function BackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

const STATUS_COLORS: Record<PesananStatus, { color: string; bg: string }> = {
  Diterima: { color: "#4A6B8C", bg: "#D9E2EC" },
  Diproses: { color: "#A8722C", bg: "#F2E8D7" },
  Siap: { color: "#586D57", bg: "#E8EBE5" },
  Selesai: { color: "#8B887D", bg: "#EFEBE2" },
};

const JENIS_COLORS: Record<PesananJenis, { color: string; bg: string }> = {
  Satuan: { color: "#2B362B", bg: "#EFEBE2" },
  Custom: { color: "#A8722C", bg: "#F2E8D7" },
  Grosir: { color: "#4A6B8C", bg: "#D9E2EC" },
};

export default async function PesananPage() {
  const profileResult = await getProfile();
  if (!profileResult.success) redirect("/login");
  const profile = profileResult.data;

  const pesananResult = await getAllPesanan();
  const pesananList = pesananResult.success ? pesananResult.data : [];

  const pending = pesananList.filter(
    (p) => p.status === "Diterima" || p.status === "Diproses"
  ).length;

  return (
    <div className="flex flex-col pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <a href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border bg-surface text-text">
          <BackIcon />
        </a>
        <p className="text-[14px] font-semibold text-text">Pesanan Manual</p>
        <div className="h-8 w-8" />
      </div>

      {/* Title */}
      <div className="px-5 pb-4 pt-5">
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
          Pesanan Manual
        </p>
        <h1 className="mt-1 text-[24px] font-semibold leading-tight tracking-tight text-text">
          Pesanan
        </h1>
        <p className="mt-1.5 text-[13px] text-text-sec">
          {pending} pending · {pesananList.length} total
        </p>
      </div>

      {/* Form buat pesanan */}
      <div className="mx-5 mb-4 rounded-[10px] border border-border bg-surface p-4">
        <p className="mb-3 text-[13.5px] font-semibold text-text">Buat Pesanan Baru</p>
        <BuatPesananForm />
      </div>

      {/* List pesanan */}
      {pesananList.length > 0 && (
        <div className="px-5">
          <p className="mb-2.5 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
            Semua Pesanan
          </p>
          <div className="flex flex-col gap-2">
            {pesananList.map((p) => {
              const sc = STATUS_COLORS[p.status as PesananStatus];
              const jc = JENIS_COLORS[p.jenis as PesananJenis];
              return (
                <div
                  key={p.id}
                  className="rounded-[10px] border border-border bg-surface p-4"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-text">{p.nama_pemesan}</p>
                      {p.kontak && (
                        <p className="text-[11.5px] text-text-dim mt-0.5">{p.kontak}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span
                        className="rounded-[4px] font-mono text-[10.5px] font-semibold px-1.5 py-0.5"
                        style={{ color: sc.color, background: sc.bg }}
                      >
                        {p.status}
                      </span>
                      <span
                        className="rounded-[4px] font-mono text-[10.5px] font-semibold px-1.5 py-0.5"
                        style={{ color: jc.color, background: jc.bg }}
                      >
                        {p.jenis}
                      </span>
                    </div>
                  </div>

                  {/* Detail */}
                  <p className="mt-2 text-[12.5px] text-text-sec line-clamp-2">{p.detail}</p>
                  {p.catatan && (
                    <p className="mt-1 text-[11.5px] text-text-dim italic">Catatan: {p.catatan}</p>
                  )}

                  {/* Footer */}
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <div>
                      <p className="text-[11px] text-text-dim">
                        {(p as any).profiles?.nama ?? "—"} ·{" "}
                        {new Date(p.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <UpdateStatusBtn
                      pesananId={p.id}
                      currentStatus={p.status as PesananStatus}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
