import { redirect } from "next/navigation";
import { getProfile } from "@/actions/auth";
import { getOrCreateTodayChecklist, getTodayChecklistsAll } from "@/actions/checklist";
import { getMyResi, getAllResi } from "@/actions/resi";
import { getAllPesanan } from "@/actions/pesanan";
import { createClient } from "@/utils/supabase/server";
import { logout } from "@/actions/auth";

function getInitials(nama: string) {
  return nama
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getTanggalIndo() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatRupiah(angka: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(angka);
}

export default async function DashboardPage() {
  const profileResult = await getProfile();
  if (!profileResult.success) redirect("/login");
  const profile = profileResult.data;

  if (profile.role === "owner") {
    return <OwnerDashboard profile={profile} />;
  }

  return <KaryawanDashboard profile={profile} />;
}

async function KaryawanDashboard({ profile }: { profile: { id: string; nama: string; role: string; gaji_pokok: number } }) {
  const supabase = await createClient();
  const [checklistResult, resiResult, pointsResult] = await Promise.all([
    getOrCreateTodayChecklist(),
    getMyResi(),
    supabase.from("karyawan_points").select("total_points").eq("id", profile.id).single(),
  ]);

  const totalPoin = pointsResult.data?.total_points ?? 0;

  const checklist = checklistResult.success ? checklistResult.data : null;
  const items = checklist?.checklist_items ?? [];
  const done = items.filter((i) => i.is_checked || i.is_verified === true).length;
  const total = items.length;
  const pct = total > 0 ? done / total : 0;

  const resiList = resiResult.success ? resiResult.data : [];
  const resiPending = resiList.filter(
    (r) => r.status === "Baru" || r.status === "Packing" || r.status === "Siap Kirim"
  ).length;

  const uncheckedItems = items
    .filter((i) => !i.is_checked && i.is_verified !== true && i.sop_items)
    .sort((a, b) => (a.sop_items?.urutan ?? 0) - (b.sop_items?.urutan ?? 0))
    .slice(0, 3);

  const tanggal = getTanggalIndo();

  return (
    <div className="flex flex-col pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-sage">
            <span className="font-mono text-[13px] font-semibold text-white">
              {getInitials(profile.nama)}
            </span>
          </div>
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-text-dim">
              {tanggal.split(",")[0].toUpperCase()}
            </p>
            <p className="text-[14px] font-semibold text-text">{profile.nama}</p>
          </div>
        </div>
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

      {/* Greeting */}
      <div className="px-5 pb-4 pt-6">
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
          Beranda
        </p>
        <h1 className="mt-1 text-[24px] font-semibold leading-tight tracking-tight text-text">
          Assalamualaikum, {profile.nama.split(" ")[0]}
        </h1>
        <p className="mt-1.5 text-[13px] text-text-sec">
          Toko Buku & Kitab Terang
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 px-5">
        <StatTile
          label="Checklist"
          value={`${done}/${total}`}
          sub={total === 0 ? "Belum ada SOP" : `${Math.round(pct * 100)}% selesai`}
          progress={pct}
        />
        <StatTile
          label="Total Poin"
          value={totalPoin >= 0 ? `+${totalPoin}` : `${totalPoin}`}
          sub="Akumulatif"
          valueColor={totalPoin < 0 ? "#9C4A3A" : "#586D57"}
        />
        <StatTile
          label="Resi Pending"
          value={String(resiPending)}
          sub="Menunggu dikirim"
        />
        <StatTile
          label="Gaji Pokok"
          value={formatRupiah(profile.gaji_pokok).replace("Rp", "").trim()}
          sub="Per bulan"
        />
      </div>

      {/* Tugas hari ini */}
      <div className="px-5 pt-6">
        <SectionHeader label="Tugas Hari Ini" href="/checklist" action="Lihat semua" />
        <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
          {total === 0 ? (
            <div className="px-4 py-6 text-center text-[13px] text-text-dim">
              Belum ada SOP yang ditugaskan
            </div>
          ) : uncheckedItems.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-[13px] font-medium text-sage">Semua tugas sudah selesai! 🎉</p>
              <p className="mt-1 text-[12px] text-text-dim">Menunggu verifikasi Mas Arya/Mbak Syafira</p>
            </div>
          ) : (
            uncheckedItems.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < uncheckedItems.length - 1 ? "1px solid #E8E3D8" : "none" }}
              >
                <div className="h-4 w-4 flex-shrink-0 rounded-[4px] border-[1.5px] border-border-hi bg-bg" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-text">
                    {item.sop_items?.teks_item}
                  </p>
                </div>
                <span className="font-mono text-[11px] font-semibold text-sage rounded-[4px] bg-sage-soft px-1.5 py-0.5">
                  +1
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Aksi cepat */}
      <div className="px-5 pt-5">
        <SectionHeader label="Aksi Cepat" />
        <div className="grid grid-cols-2 gap-2">
          <ActionTile
            href="/resi"
            icon={<TruckIcon />}
            title="Resi Saya"
            sub={`${resiPending} menunggu`}
          />
          <ActionTile
            href="/pesanan"
            icon={<BagIcon />}
            title="Pesanan"
            sub="Lihat semua"
          />
        </div>
      </div>
    </div>
  );
}

async function OwnerDashboard({ profile }: { profile: { id: string; nama: string; role: string; gaji_pokok: number } }) {
  const supabase = await createClient();
  const [checklistResult, karyawanResiResult, pesananResult, pointsResult] = await Promise.all([
    getTodayChecklistsAll(),
    getAllResi(),
    getAllPesanan(),
    supabase.from("karyawan_points").select("id, nama, total_points"),
  ]);

  const karyawanPoints = pointsResult.data;

  const checklists = checklistResult.success ? checklistResult.data : [];
  const resiList = karyawanResiResult.success ? karyawanResiResult.data : [];
  const pesananList = pesananResult.success ? pesananResult.data : [];

  const resiHariIni = resiList.filter((r) => {
    const today = new Date().toISOString().split("T")[0];
    return r.created_at.startsWith(today);
  }).length;

  const pesananPending = pesananList.filter(
    (p) => p.status === "Diterima" || p.status === "Diproses"
  ).length;

  const checklistDone = checklists.reduce((sum, c) => {
    return sum + c.checklist_items.filter((i) => i.is_checked || i.is_verified === true).length;
  }, 0);
  const checklistTotal = checklists.reduce((sum, c) => sum + c.checklist_items.length, 0);

  const pendingVerif = checklists.reduce((sum, c) => {
    return sum + c.checklist_items.filter((i) => i.is_checked && i.is_verified === null).length;
  }, 0);

  const tanggal = getTanggalIndo();

  return (
    <div className="flex flex-col pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-sage-dark">
            <span className="font-mono text-[13px] font-semibold text-white">
              {getInitials(profile.nama)}
            </span>
          </div>
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-text-dim">
              {tanggal.split(",")[0].toUpperCase()} · OWNER
            </p>
            <p className="text-[14px] font-semibold text-text">{profile.nama}</p>
          </div>
        </div>
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

      {/* Greeting */}
      <div className="px-5 pb-4 pt-6">
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
          Dashboard Owner
        </p>
        <h1 className="mt-1 text-[22px] font-semibold leading-tight tracking-tight text-text">
          Selamat pagi, {profile.nama.split(" ")[0]}
        </h1>
        <p className="mt-1.5 text-[13px] text-text-sec">{tanggal}</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-2 px-5">
        <StatTile
          label="Anggota"
          value={String(checklists.length)}
          sub="aktif hari ini"
        />
        <StatTile
          label="Checklist"
          value={`${checklistDone}/${checklistTotal}`}
          sub={checklistTotal > 0 ? `${Math.round(checklistDone / checklistTotal * 100)}% rate` : "Belum ada"}
          progress={checklistTotal > 0 ? checklistDone / checklistTotal : 0}
        />
        <StatTile
          label="Resi Hari Ini"
          value={String(resiHariIni)}
          sub="paket masuk"
        />
        <StatTile
          label="Pesanan Pending"
          value={String(pesananPending)}
          sub="perlu diproses"
        />
      </div>

      {/* Menunggu Verifikasi */}
      {pendingVerif > 0 && (
        <div className="px-5 pt-5">
          <SectionHeader label="Menunggu Verifikasi" href="/checklist" action={`${pendingVerif} item`} />
          <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
            {checklists.slice(0, 3).map((c, i) => {
              const karyawanPending = c.checklist_items.filter(
                (item) => item.is_checked && item.is_verified === null
              ).length;
              if (karyawanPending === 0) return null;
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: i < Math.min(checklists.length, 3) - 1 ? "1px solid #E8E3D8" : "none" }}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-sage">
                    <span className="font-mono text-[10px] font-semibold text-white">
                      {getInitials(c.profiles?.nama ?? "?")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-text">{c.profiles?.nama}</p>
                    <p className="text-[11px] text-text-dim">{karyawanPending} item menunggu</p>
                  </div>
                  <span className="font-mono text-[10.5px] font-semibold text-white rounded-[4px] bg-sage px-2 py-0.5">
                    {karyawanPending}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Poin karyawan */}
      {karyawanPoints && karyawanPoints.length > 0 && (
        <div className="px-5 pt-5">
          <SectionHeader label="Poin Anggota" href="/karyawan" action="Lihat semua" />
          <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
            {karyawanPoints.map((k, i) => (
              <div
                key={k.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < karyawanPoints.length - 1 ? "1px solid #E8E3D8" : "none" }}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-sage">
                  <span className="font-mono text-[10px] font-semibold text-white">
                    {getInitials(k.nama)}
                  </span>
                </div>
                <p className="flex-1 text-[13px] font-medium text-text">{k.nama}</p>
                <span
                  className="font-mono text-[12px] font-semibold"
                  style={{ color: k.total_points < 0 ? "#9C4A3A" : "#586D57" }}
                >
                  {k.total_points >= 0 ? `+${k.total_points}` : k.total_points}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aksi cepat owner */}
      <div className="px-5 pt-5">
        <SectionHeader label="Aksi Cepat" />
        <div className="grid grid-cols-2 gap-2">
          <ActionTile href="/resi" icon={<TruckIcon />} title="Upload Resi" sub={`${resiHariIni} hari ini`} />
          <ActionTile href="/pesanan" icon={<BagIcon />} title="Pesanan" sub={`${pesananPending} pending`} />
          <ActionTile href="/karyawan" icon={<UsersIcon />} title="Anggota" sub="Data & poin" />
          <ActionTile href="/gaji" icon={<WalletIcon />} title="Gaji" sub="Rekap bulanan" />
        </div>
      </div>
    </div>
  );
}

// ─── Shared Sub-components ───────────────────────────────────

function StatTile({
  label,
  value,
  sub,
  progress,
  valueColor,
}: {
  label: string;
  value: string;
  sub: string;
  progress?: number;
  valueColor?: string;
}) {
  return (
    <div className="rounded-[10px] border border-border bg-surface p-3.5">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-text-dim">
        {label}
      </p>
      <p
        className="mt-2 font-mono text-[24px] font-semibold leading-none tracking-tight"
        style={{ color: valueColor ?? "#2B362B" }}
      >
        {value}
      </p>
      <p className="mt-1.5 text-[11px] font-medium text-text-sec">{sub}</p>
      {progress !== undefined && (
        <div className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-bg3">
          <div
            className="h-full bg-sage transition-all"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  label,
  href,
  action,
}: {
  label: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
        {label}
      </p>
      {action && href && (
        <a href={href} className="text-[12px] font-medium text-sage">
          {action}
        </a>
      )}
      {action && !href && (
        <span className="text-[12px] font-medium text-text-dim">{action}</span>
      )}
    </div>
  );
}

function ActionTile({
  href,
  icon,
  title,
  sub,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <a
      href={href}
      className="rounded-[10px] border border-border bg-surface p-3.5 transition-colors active:bg-hover"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-sage-soft">
        {icon}
      </div>
      <p className="mt-2.5 text-[13.5px] font-semibold text-text">{title}</p>
      <p className="mt-0.5 text-[11.5px] text-text-dim">{sub}</p>
    </a>
  );
}

function TruckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#586D57" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7h11v10H2zM13 10h5l3 3v4h-8z" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#586D57" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8h14l-1 12H6L5 8z" />
      <path d="M9 8V6a3 3 0 016 0v2" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#586D57" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="3.5" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M3 19c0-3 3-5 6-5s6 2 6 5" />
      <path d="M15 19c0-2.5 1-3.5 3-3.5s3 1 3 3" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#586D57" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M3 10h18M16 15h2" />
    </svg>
  );
}
