import { redirect } from "next/navigation";
import { getProfile } from "@/actions/auth";
import { getKaryawanList } from "@/actions/karyawan";
import { getAllKaryawanPoints } from "@/actions/gaji";
import { TambahKaryawanForm } from "./tambah-karyawan-form";

function BackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function KaryawanPage() {
  const profileResult = await getProfile();
  if (!profileResult.success) redirect("/login");
  if (profileResult.data.role !== "owner") redirect("/dashboard");

  const [karyawanResult, pointsResult] = await Promise.all([
    getKaryawanList(),
    getAllKaryawanPoints(),
  ]);

  const karyawanList = karyawanResult.success ? karyawanResult.data : [];
  const pointsMap = new Map(
    (pointsResult.success ? pointsResult.data : []).map((k) => [k.id, k.total_points])
  );

  return (
    <div className="flex flex-col pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <a href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border bg-surface text-text">
          <BackIcon />
        </a>
        <p className="text-[14px] font-semibold text-text">Data Karyawan</p>
        <div className="h-8 w-8" />
      </div>

      {/* Title */}
      <div className="px-5 pb-4 pt-5">
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
          Manajemen
        </p>
        <h1 className="mt-1 text-[24px] font-semibold leading-tight tracking-tight text-text">
          Karyawan
        </h1>
        <p className="mt-1.5 text-[13px] text-text-sec">
          {karyawanList.length} karyawan terdaftar
        </p>
      </div>

      {/* List karyawan */}
      <div className="mx-5">
        {karyawanList.length === 0 ? (
          <div className="rounded-[10px] border border-border bg-surface px-4 py-10 text-center">
            <p className="text-[13px] text-text-dim">Belum ada karyawan terdaftar</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
            {karyawanList.map((k, i) => {
              const poin = pointsMap.get(k.id) ?? 0;
              const initials = k.nama.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
              return (
                <div
                  key={k.id}
                  className="flex items-center gap-3 px-4 py-4"
                  style={{ borderBottom: i < karyawanList.length - 1 ? "1px solid #E8E3D8" : "none" }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-sage flex-shrink-0">
                    <span className="font-mono text-[13px] font-semibold text-white">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-text">{k.nama}</p>
                    <p className="text-[12px] text-text-dim mt-0.5">
                      Gaji {formatRupiah(k.gaji_pokok)}/bln
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className="font-mono text-[15px] font-semibold"
                      style={{ color: poin < 0 ? "#9C4A3A" : "#586D57" }}
                    >
                      {poin >= 0 ? `+${poin}` : poin}
                    </p>
                    <p className="text-[10.5px] text-text-dim font-mono">poin</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form tambah karyawan */}
      <div className="mx-5 mt-4">
        <TambahKaryawanForm />
      </div>

      {/* SOP management link */}
      <div className="mx-5 mt-3">
        <a
          href="/sop"
          className="flex items-center justify-between rounded-[10px] border border-border bg-surface px-4 py-3.5"
        >
          <div>
            <p className="text-[13.5px] font-semibold text-text">Kelola SOP Karyawan</p>
            <p className="text-[12px] text-text-dim mt-0.5">Tambah, edit, hapus item SOP</p>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B887D" strokeWidth="1.5" strokeLinecap="round"><path d="M9 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  );
}
