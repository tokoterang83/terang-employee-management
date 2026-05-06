import { redirect } from "next/navigation";
import { getProfile } from "@/actions/auth";
import { getOrCreateTodayChecklist, getTodayChecklistsAll } from "@/actions/checklist";
import { ChecklistKaryawan } from "./checklist-karyawan";
import { VerifikasiOwner } from "./verifikasi-owner";

function BackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export default async function ChecklistPage() {
  const profileResult = await getProfile();
  if (!profileResult.success) redirect("/login");
  const profile = profileResult.data;

  const tanggal = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (profile.role === "owner") {
    const checklistResult = await getTodayChecklistsAll();
    const checklists = checklistResult.success ? checklistResult.data : [];

    const totalPending = checklists.reduce((sum, c) => {
      return sum + c.checklist_items.filter((i) => i.is_checked && i.is_verified === null).length;
    }, 0);

    return (
      <div className="flex flex-col pb-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-1">
          <a href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border bg-surface text-text">
            <BackIcon />
          </a>
          <p className="text-[13px] font-semibold text-text">{tanggal}</p>
          <div className="h-8 w-8" />
        </div>

        {/* Title */}
        <div className="px-5 pb-4 pt-5">
          <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
            Verifikasi Checklist
          </p>
          <h1 className="mt-1 text-[24px] font-semibold leading-tight tracking-tight text-text">
            Checklist Harian
          </h1>
          <p className="mt-1.5 text-[13px] text-text-sec">
            {checklists.length} karyawan · {totalPending} item menunggu verifikasi
          </p>
        </div>

        <VerifikasiOwner checklists={checklists as any} />
      </div>
    );
  }

  // Karyawan
  const checklistResult = await getOrCreateTodayChecklist();
  if (!checklistResult.success) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
        <p className="text-[14px] font-medium text-text">Gagal memuat checklist</p>
        <p className="mt-1 text-[12px] text-text-dim">{checklistResult.error}</p>
      </div>
    );
  }

  const checklist = checklistResult.data;
  const items = checklist.checklist_items ?? [];
  const isVerified = checklist.status_verif === "verified";

  return (
    <div className="flex flex-col pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <a href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border bg-surface text-text">
          <BackIcon />
        </a>
        <p className="text-[13px] font-semibold text-text">{tanggal}</p>
        <div className="h-8 w-8" />
      </div>

      {/* Title */}
      <div className="px-5 pb-4 pt-5">
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">
          SOP Harian
        </p>
        <h1 className="mt-1 text-[24px] font-semibold leading-tight tracking-tight text-text">
          Checklist Harian
        </h1>
        {isVerified && (
          <p className="mt-1.5 text-[13px] font-medium text-sage">
            Sudah diverifikasi hari ini ✓
          </p>
        )}
        {!isVerified && (
          <p className="mt-1.5 text-[13px] text-text-sec">
            Centang item yang sudah dikerjakan
          </p>
        )}
      </div>

      <ChecklistKaryawan
        checklistId={checklist.id}
        items={items as any}
        isVerified={isVerified}
      />
    </div>
  );
}
