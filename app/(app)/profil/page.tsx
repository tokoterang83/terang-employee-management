import { redirect } from "next/navigation";
import { getProfile, logout } from "@/actions/auth";
import { getMyPoints, getMyGajiHistory, getPointHistory } from "@/actions/gaji";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export default async function ProfilPage() {
  const profileResult = await getProfile();
  if (!profileResult.success) redirect("/login");
  const profile = profileResult.data;

  if (profile.role !== "karyawan") {
    redirect("/dashboard");
  }

  const [pointsResult, gajiResult, pointHistoryResult] = await Promise.all([
    getMyPoints(),
    getMyGajiHistory(),
    getPointHistory(),
  ]);

  const totalPoin = pointsResult.success ? pointsResult.data : 0;
  const gajiHistory = gajiResult.success ? gajiResult.data : [];
  const pointHistory = pointHistoryResult.success ? pointHistoryResult.data : [];

  const initials = profile.nama.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  return (
    <div className="flex flex-col pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5">
        <p className="text-[16px] font-semibold text-text">Profil</p>
        <form action={logout}>
          <button
            type="submit"
            className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border bg-surface text-text-dim"
            title="Keluar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3" />
              <path d="M9 8l-4 4 4 4M5 12h11" />
            </svg>
          </button>
        </form>
      </div>

      {/* Profile card */}
      <div className="mx-5 mt-5 rounded-[10px] border border-border bg-surface p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-[10px] bg-sage flex-shrink-0">
            <span className="font-mono text-[18px] font-semibold text-white">{initials}</span>
          </div>
          <div>
            <p className="text-[16px] font-semibold text-text">{profile.nama}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-[4px] bg-info-soft font-mono text-[10.5px] font-semibold text-info px-1.5 py-0.5">
                KARYAWAN
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-0 border-t border-border pt-4">
          <div className="flex flex-col items-center border-r border-border">
            <p
              className="font-mono text-[22px] font-semibold"
              style={{ color: totalPoin < 0 ? "#9C4A3A" : "#2B362B" }}
            >
              {totalPoin >= 0 ? `+${totalPoin}` : totalPoin}
            </p>
            <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-text-dim">
              Total Poin
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p className="font-mono text-[22px] font-semibold text-text">
              {formatRupiah(profile.gaji_pokok).replace("Rp", "").replace(/\s/, "")}
            </p>
            <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-text-dim">
              Gaji Pokok
            </p>
          </div>
        </div>
      </div>

      {/* Histori poin */}
      <div className="px-5 pt-5">
        <p className="mb-2.5 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
          Histori Poin
        </p>
        <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
          {pointHistory.length === 0 ? (
            <div className="px-4 py-6 text-center text-[13px] text-text-dim">
              Belum ada perubahan poin
            </div>
          ) : (
            pointHistory.slice(0, 20).map((log, i) => (
              <div
                key={log.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < Math.min(pointHistory.length, 20) - 1 ? "1px solid #E8E3D8" : "none" }}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-[6px] flex-shrink-0 font-mono text-[13px] font-bold"
                  style={{
                    background: log.delta > 0 ? "#E8EBE5" : "#EFD9D2",
                    color: log.delta > 0 ? "#586D57" : "#9C4A3A",
                  }}
                >
                  {log.delta > 0 ? `+${log.delta}` : log.delta}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-text">
                    {log.alasan ?? "Verifikasi SOP"}
                  </p>
                  <p className="text-[11px] text-text-dim">
                    {new Date(log.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Histori gaji */}
      <div className="px-5 pt-5">
        <p className="mb-2.5 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
          Riwayat Gaji
        </p>
        <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
          {gajiHistory.length === 0 ? (
            <div className="px-4 py-6 text-center text-[13px] text-text-dim">
              Belum ada data gaji
            </div>
          ) : (
            gajiHistory.map((g, i) => {
              const total = g.gaji_pokok + g.bonus;
              const isPaid = g.status_bayar === "Sudah Bayar";
              return (
                <div
                  key={g.id}
                  className="flex items-center gap-3 px-4 py-3.5"
                  style={{ borderBottom: i < gajiHistory.length - 1 ? "1px solid #E8E3D8" : "none" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-text">
                      {BULAN[g.bulan - 1]} {g.tahun}
                    </p>
                    <p className="text-[11.5px] text-text-dim mt-0.5">
                      Pokok {formatRupiah(g.gaji_pokok)}
                      {g.bonus > 0 && ` + Bonus ${formatRupiah(g.bonus)}`}
                    </p>
                    {g.catatan_bonus && (
                      <p className="text-[11px] text-text-dim italic mt-0.5">{g.catatan_bonus}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[13.5px] font-semibold text-text">{formatRupiah(total)}</p>
                    <span
                      className="rounded-[4px] font-mono text-[10px] font-semibold px-1.5 py-0.5"
                      style={{
                        background: isPaid ? "#E8EBE5" : "#F2E8D7",
                        color: isPaid ? "#586D57" : "#A8722C",
                      }}
                    >
                      {g.status_bayar}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <p className="mt-6 text-center font-mono text-[10.5px] text-text-mute">
        terang v1.0 · made with ﷽
      </p>
    </div>
  );
}
