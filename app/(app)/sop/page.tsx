import { redirect } from "next/navigation";
import { getProfile } from "@/actions/auth";
import { getKaryawanList } from "@/actions/karyawan";
import { createClient } from "@/utils/supabase/server";
import { SopManager } from "./sop-manager";

function BackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export default async function SopPage() {
  const profileResult = await getProfile();
  if (!profileResult.success) redirect("/login");
  if (profileResult.data.role !== "owner") redirect("/dashboard");

  const karyawanResult = await getKaryawanList();
  const karyawanList = karyawanResult.success ? karyawanResult.data : [];

  const supabase = await createClient();
  const { data: allTemplates } = await supabase
    .from("sop_templates")
    .select("*, sop_items(id, urutan, teks_item, created_at, template_id)")
    .order("created_at")
    .order("urutan", { referencedTable: "sop_items" });

  const templates = allTemplates ?? [];

  return (
    <div className="flex flex-col pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <a href="/karyawan" className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border bg-surface text-text">
          <BackIcon />
        </a>
        <p className="text-[14px] font-semibold text-text">Kelola SOP</p>
        <div className="h-8 w-8" />
      </div>

      <div className="px-5 pb-5 pt-5">
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-dim">SOP Anggota</p>
        <h1 className="mt-1 text-[24px] font-semibold leading-tight tracking-tight text-text">SOP & Checklist</h1>
        <p className="mt-1.5 text-[13px] text-text-sec">
          {templates.length} SOP · {karyawanList.length} anggota
        </p>
      </div>

      <SopManager karyawanList={karyawanList} initialTemplates={templates as any} />
    </div>
  );
}
