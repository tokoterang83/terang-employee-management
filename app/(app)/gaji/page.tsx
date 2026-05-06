import { redirect } from "next/navigation";
import { getProfile } from "@/actions/auth";
import { getGajiByBulan } from "@/actions/gaji";
import { getKaryawanList } from "@/actions/karyawan";
import { BayarBtn } from "./bayar-btn";
import { InputGajiForm } from "./input-gaji-form";

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

const BULAN_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default async function GajiPage() {
  const profileResult = await getProfile();
  if (!profileResult.success) redirect("/login");
  if (profileResult.data.role !== "owner") redirect("/dashboard");

  const now = new Date();
  const bulan = now.getMonth() + 1;
  const tahun = now.getFullYear();

  const [gajiResult, karyawanResult] = await Promise.all([
    getGajiByBulan(bulan, tahun),
    getKaryawanList(),
  ]);

  const gajiList = gajiResult.success ? gajiResult.data : [];
  const karyawanList = karyawanResult.success ? karyawanResult.data : [];

  const totalGaji = gajiList.reduce((sum, g) => sum + g.gaji_pokok + g.bonus, 0);
  const sudahBayar = gajiList.filter((g) => g.status_bayar === "Sudah Bayar").length;

  return (
    <div className="flex flex-col pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <a href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border bg-surface text-text">
          <BackIcon />
        </a>
        <p className="text-[14px] font-semibold text-text">Gaji Bulanan</p>
        <div className="h-8 w-8" />
      </div>

      {/* Title */}
      <div className="px-5 pb-4 pt-5">
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
          Rekap Penggajian
        </p>
        <h1 className="mt-1 text-[24px] font-semibold leading-tight tracking-tight text-text">
          {BULAN_NAMES[bulan - 1]} {tahun}
        </h1>
        <p className="mt-1.5 text-[13px] text-text-sec">
          {sudahBayar}/{gajiList.length} terbayar · Total {formatRupiah(totalGaji)}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-2 px-5">
        <div className="rounded-[10px] border border-border bg-surface p-3.5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-text-dim">Total Gaji</p>
          <p className="mt-2 font-mono text-[20px] font-semibold leading-none text-text">
            {formatRupiah(totalGaji).replace("Rp", "Rp ")}
          </p>
          <p className="mt-1 text-[11px] text-text-sec">{gajiList.length} karyawan</p>
        </div>
        <div className="rounded-[10px] border border-border bg-surface p-3.5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-text-dim">Status Bayar</p>
          <p className="mt-2 font-mono text-[20px] font-semibold leading-none text-text">
            {sudahBayar}/{gajiList.length}
          </p>
          <p className="mt-1 text-[11px] text-text-sec">sudah terbayar</p>
          {gajiList.length > 0 && (
            <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-bg3">
              <div
                className="h-full bg-sage"
                style={{ width: `${Math.round(sudahBayar / gajiList.length * 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Input gaji form */}
      <div className="mx-5 mt-4 rounded-[10px] border border-border bg-surface p-4">
        <p className="mb-3 text-[13.5px] font-semibold text-text">Input / Update Gaji</p>
        <InputGajiForm karyawanList={karyawanList} bulan={bulan} tahun={tahun} />
      </div>

      {/* List rekap gaji */}
      {gajiList.length > 0 && (
        <div className="px-5 pt-4">
          <p className="mb-2.5 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
            Rekap {BULAN_NAMES[bulan - 1]} {tahun}
          </p>
          <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
            {gajiList.map((g, i) => {
              const total = g.gaji_pokok + g.bonus;
              const isPaid = g.status_bayar === "Sudah Bayar";
              const nama = (g as any).profiles?.nama ?? "—";
              return (
                <div
                  key={g.id}
                  className="flex items-start gap-3 px-4 py-4"
                  style={{ borderBottom: i < gajiList.length - 1 ? "1px solid #E8E3D8" : "none" }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-sage flex-shrink-0">
                    <span className="font-mono text-[11px] font-semibold text-white">
                      {nama.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-text">{nama}</p>
                    <p className="text-[11.5px] text-text-dim mt-0.5">
                      Pokok {formatRupiah(g.gaji_pokok)}
                      {g.bonus > 0 && ` + Bonus ${formatRupiah(g.bonus)}`}
                    </p>
                    {g.catatan_bonus && (
                      <p className="text-[11px] text-text-dim italic mt-0.5">{g.catatan_bonus}</p>
                    )}
                    <p className="mt-2 text-[13px] font-semibold text-text">
                      Total: {formatRupiah(total)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 mt-1">
                    {isPaid ? (
                      <span className="rounded-[6px] bg-sage-soft font-mono text-[10.5px] font-semibold text-sage px-2 py-0.5">
                        Lunas
                      </span>
                    ) : (
                      <BayarBtn gajiId={g.id} />
                    )}
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
