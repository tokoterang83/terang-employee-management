import { redirect } from "next/navigation";
import { getProfile } from "@/actions/auth";
import { getAllResi, getMyResi } from "@/actions/resi";
import { getKaryawanList } from "@/actions/karyawan";
import { ResiStatusBtn } from "./resi-status-btn";
import { UploadResiForm } from "./upload-resi-form";
import type { ResiStatus } from "@/lib/types";

function BackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

const STATUS_COLORS: Record<ResiStatus, { color: string; bg: string }> = {
  Baru: { color: "#4A6B8C", bg: "#D9E2EC" },
  Packing: { color: "#A8722C", bg: "#F2E8D7" },
  "Siap Kirim": { color: "#586D57", bg: "#E8EBE5" },
  Terkirim: { color: "#8B887D", bg: "#EFEBE2" },
};

export default async function ResiPage() {
  const profileResult = await getProfile();
  if (!profileResult.success) redirect("/login");
  const profile = profileResult.data;

  if (profile.role === "owner") {
    const [resiResult, karyawanResult] = await Promise.all([
      getAllResi(),
      getKaryawanList(),
    ]);

    const resiList = resiResult.success ? resiResult.data : [];
    const karyawanList = karyawanResult.success ? karyawanResult.data : [];

    const byStatus = {
      Baru: resiList.filter((r) => r.status === "Baru").length,
      Packing: resiList.filter((r) => r.status === "Packing").length,
      "Siap Kirim": resiList.filter((r) => r.status === "Siap Kirim").length,
      Terkirim: resiList.filter((r) => r.status === "Terkirim").length,
    };

    return (
      <div className="flex flex-col pb-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-1">
          <a href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border bg-surface text-text">
            <BackIcon />
          </a>
          <p className="text-[14px] font-semibold text-text">Resi Online</p>
          <div className="h-8 w-8" />
        </div>

        {/* Title */}
        <div className="px-5 pb-4 pt-5">
          <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
            Pesanan Online
          </p>
          <h1 className="mt-1 text-[24px] font-semibold leading-tight tracking-tight text-text">
            Resi PDF
          </h1>
          <p className="mt-1.5 text-[13px] text-text-sec">
            {resiList.length} resi total
          </p>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-4 gap-1.5 px-5">
          {(["Baru", "Packing", "Siap Kirim", "Terkirim"] as ResiStatus[]).map((s) => (
            <div key={s} className="rounded-[8px] border border-border bg-surface p-2.5 text-center">
              <p
                className="font-mono text-[18px] font-semibold"
                style={{ color: STATUS_COLORS[s].color }}
              >
                {byStatus[s]}
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-text-dim leading-tight">{s}</p>
            </div>
          ))}
        </div>

        {/* Upload form */}
        <div className="mx-5 mt-4 rounded-[10px] border border-border bg-surface p-4">
          <p className="mb-3 text-[13.5px] font-semibold text-text">Upload Resi Baru</p>
          <UploadResiForm karyawanList={karyawanList} />
        </div>

        {/* List semua resi */}
        {resiList.length > 0 && (
          <div className="px-5 pt-4">
            <p className="mb-2.5 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
              Semua Resi
            </p>
            <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
              {resiList.map((resi, i) => {
                const sc = STATUS_COLORS[resi.status as ResiStatus];
                return (
                  <div
                    key={resi.id}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: i < resiList.length - 1 ? "1px solid #E8E3D8" : "none" }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-text truncate">
                        {resi.filename}
                      </p>
                      <p className="text-[11px] text-text-dim mt-0.5">
                        {(resi as any).profiles?.nama ?? "Belum di-assign"} ·{" "}
                        {new Date(resi.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <span
                      className="flex-shrink-0 rounded-[4px] font-mono text-[10.5px] font-semibold px-1.5 py-0.5"
                      style={{ color: sc.color, background: sc.bg }}
                    >
                      {resi.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Karyawan
  const resiResult = await getMyResi();
  const resiList = resiResult.success ? resiResult.data : [];
  const pending = resiList.filter((r) => r.status !== "Terkirim").length;

  return (
    <div className="flex flex-col pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <a href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border bg-surface text-text">
          <BackIcon />
        </a>
        <p className="text-[14px] font-semibold text-text">Resi Saya</p>
        <div className="h-8 w-8" />
      </div>

      {/* Title */}
      <div className="px-5 pb-4 pt-5">
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
          Pesanan Online
        </p>
        <h1 className="mt-1 text-[24px] font-semibold leading-tight tracking-tight text-text">
          Resi Saya
        </h1>
        <p className="mt-1.5 text-[13px] text-text-sec">
          {pending} menunggu · {resiList.length} total
        </p>
      </div>

      {resiList.length === 0 ? (
        <div className="mx-5 rounded-[10px] border border-border bg-surface px-4 py-10 text-center">
          <p className="text-[13px] text-text-dim">Belum ada resi yang di-assign ke kamu</p>
        </div>
      ) : (
        <div className="mx-5 overflow-hidden rounded-[10px] border border-border bg-surface">
          {resiList.map((resi, i) => {
            const sc = STATUS_COLORS[resi.status as ResiStatus];
            return (
              <div
                key={resi.id}
                className="flex items-start gap-3 px-4 py-3.5"
                style={{ borderBottom: i < resiList.length - 1 ? "1px solid #E8E3D8" : "none" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-text">{resi.filename}</p>
                  <p className="mt-0.5 text-[11px] text-text-dim">
                    {new Date(resi.created_at).toLocaleDateString("id-ID", {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className="rounded-[4px] font-mono text-[10.5px] font-semibold px-1.5 py-0.5"
                      style={{ color: sc.color, background: sc.bg }}
                    >
                      {resi.status}
                    </span>
                    {resi.status !== "Terkirim" && (
                      <ResiStatusBtn resiId={resi.id} currentStatus={resi.status as ResiStatus} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
