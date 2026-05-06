"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  ToggleChecklistItemSchema,
  VerifyChecklistItemSchema,
} from "@/lib/validations";
import type {
  ActionResult,
  ChecklistDaily,
  ChecklistItem,
} from "@/lib/types";

// Populate checklist_items dari SOP yang berlaku hari ini (permanent + daily assignment)
async function syncChecklistItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  checklistId: string,
  karyawanId: string,
  today: string
) {
  // Kumpulkan template_id yang berlaku untuk karyawan ini hari ini
  const templateIds = new Set<string>();

  // 1. Dari daily assignments (jika tabel sudah ada)
  try {
    const { data: daily } = await supabase
      .from("sop_daily_assignments")
      .select("template_id")
      .eq("karyawan_id", karyawanId)
      .eq("tanggal", today);
    daily?.forEach((d) => templateIds.add(d.template_id));

    // 2. Dari karyawan_id permanen — hanya jika template tidak punya daily assignment hari ini
    const { data: assigned } = await supabase
      .from("sop_daily_assignments")
      .select("template_id")
      .eq("tanggal", today);
    const overriddenIds = new Set((assigned ?? []).map((a) => a.template_id));

    const { data: permanent } = await supabase
      .from("sop_templates")
      .select("id")
      .eq("karyawan_id", karyawanId);
    permanent?.forEach((t) => {
      if (!overriddenIds.has(t.id)) templateIds.add(t.id);
    });
  } catch {
    // Tabel sop_daily_assignments belum ada — pakai permanent saja
    const { data: permanent } = await supabase
      .from("sop_templates")
      .select("id")
      .eq("karyawan_id", karyawanId);
    permanent?.forEach((t) => templateIds.add(t.id));
  }

  if (templateIds.size === 0) return;

  // Ambil semua sop_items dari template yang berlaku
  const { data: sopItems } = await supabase
    .from("sop_items")
    .select("id")
    .in("template_id", [...templateIds]);

  if (!sopItems || sopItems.length === 0) return;

  // Pakai admin client karena karyawan tidak punya izin INSERT ke checklist_items (hanya trigger DB)
  const admin = createAdminClient();
  await admin
    .from("checklist_items")
    .insert(sopItems.map((si) => ({ checklist_id: checklistId, sop_item_id: si.id })));
}

// Karyawan: ambil atau buat checklist hari ini
export async function getOrCreateTodayChecklist(): Promise<
  ActionResult<ChecklistDaily & { checklist_items: (ChecklistItem & { sop_items: { teks_item: string; urutan: number } | null })[] }>
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  const today = new Date().toISOString().split("T")[0];

  // Coba ambil yang sudah ada
  let { data: existing } = await supabase
    .from("checklist_daily")
    .select("*, checklist_items(*, sop_items(teks_item, urutan, template_id, sop_templates(id, nama_sop, sub_judul)))")
    .eq("karyawan_id", user.id)
    .eq("tanggal", today)
    .single();

  // Jika checklist sudah ada tapi kosong, sync items dari SOP yang berlaku hari ini
  if (existing && existing.checklist_items.length === 0) {
    await syncChecklistItems(supabase, existing.id, user.id, today);
    const { data: refreshed } = await supabase
      .from("checklist_daily")
      .select("*, checklist_items(*, sop_items(teks_item, urutan, template_id, sop_templates(id, nama_sop, sub_judul)))")
      .eq("id", existing.id)
      .single();
    if (refreshed) existing = refreshed;
  }

  if (existing) {
    return { success: true, data: existing as typeof existing & { checklist_items: (ChecklistItem & { sop_items: { teks_item: string; urutan: number } | null })[] } };
  }

  // Buat baru — trigger auto-populate items dari SOP
  const { data: created, error } = await supabase
    .from("checklist_daily")
    .insert({ karyawan_id: user.id, tanggal: today })
    .select("*, checklist_items(*, sop_items(teks_item, urutan, template_id, sop_templates(id, nama_sop, sub_judul)))")
    .single();

  if (error || !created) {
    return { success: false, error: "Gagal membuat checklist hari ini" };
  }

  return { success: true, data: created as typeof created & { checklist_items: (ChecklistItem & { sop_items: { teks_item: string; urutan: number } | null })[] } };
}

// Karyawan: centang/hapus centang item checklist
export async function toggleChecklistItem(
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    checklist_item_id: formData.get("checklist_item_id") as string,
    is_checked: formData.get("is_checked") === "true",
  };

  const parsed = ToggleChecklistItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("checklist_items")
    .update({ is_checked: parsed.data.is_checked })
    .eq("id", parsed.data.checklist_item_id);

  if (error) {
    // RLS akan reject jika checklist sudah diverifikasi
    return {
      success: false,
      error:
        error.code === "42501"
          ? "Checklist sudah diverifikasi, tidak bisa diubah"
          : "Gagal update checklist",
    };
  }

  revalidatePath("/checklist");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

// Owner: lihat semua checklist hari ini (semua karyawan)
export async function getTodayChecklistsAll(): Promise<
  ActionResult<
    (ChecklistDaily & {
      profiles: { nama: string } | null;
      checklist_items: (ChecklistItem & {
        sop_items: { teks_item: string; urutan: number } | null;
      })[];
    })[]
  >
> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("checklist_daily")
    .select(
      "*, profiles(nama), checklist_items(*, sop_items(teks_item, urutan, template_id, sop_templates(id, nama_sop, sub_judul)))"
    )
    .eq("tanggal", today)
    .order("created_at");

  if (error) {
    return { success: false, error: "Gagal memuat checklist" };
  }

  return { success: true, data: (data ?? []) as typeof data & [] };
}

// Owner: lihat histori checklist karyawan tertentu
export async function getChecklistHistoryByKaryawan(
  karyawanId: string,
  limit = 30
): Promise<ActionResult<ChecklistDaily[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("checklist_daily")
    .select("*")
    .eq("karyawan_id", karyawanId)
    .order("tanggal", { ascending: false })
    .limit(limit);

  if (error) {
    return { success: false, error: "Gagal memuat histori checklist" };
  }

  return { success: true, data: data ?? [] };
}

// Owner: verifikasi satu item checklist (+1/-1 point)
// Trigger di DB yang auto-log poin ke point_log
export async function verifyChecklistItem(
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    checklist_item_id: formData.get("checklist_item_id") as string,
    is_verified: formData.get("is_verified") === "true",
  };

  const parsed = VerifyChecklistItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("checklist_items")
    .update({ is_verified: parsed.data.is_verified })
    .eq("id", parsed.data.checklist_item_id);

  if (error) {
    return { success: false, error: "Gagal verifikasi item" };
  }

  revalidatePath("/checklist");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

// Owner: selesaikan verifikasi seluruh checklist harian
// Update status_verif + verified_at + verified_by di checklist_daily
export async function finalizeChecklistVerification(
  checklistId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  const { error } = await supabase
    .from("checklist_daily")
    .update({
      status_verif: "verified",
      verified_at: new Date().toISOString(),
      verified_by: user.id,
    })
    .eq("id", checklistId);

  if (error) {
    return { success: false, error: "Gagal menyelesaikan verifikasi" };
  }

  revalidatePath("/checklist");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

// Owner: siapkan (reset + isi ulang) checklist semua anggota untuk tanggal tertentu
export async function prepareAllChecklists(
  tanggal: string
): Promise<ActionResult<{ count: number }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  const admin = createAdminClient();

  const { data: karyawanList } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "karyawan");

  if (!karyawanList || karyawanList.length === 0) {
    return { success: false, error: "Tidak ada anggota terdaftar" };
  }

  const { data: allDailyAssignments } = await admin
    .from("sop_daily_assignments")
    .select("template_id, karyawan_id")
    .eq("tanggal", tanggal);

  const overriddenTemplateIds = new Set(
    (allDailyAssignments ?? []).map((a) => a.template_id)
  );

  let count = 0;

  for (const karyawan of karyawanList) {
    const templateIds = new Set<string>();

    (allDailyAssignments ?? [])
      .filter((a) => a.karyawan_id === karyawan.id)
      .forEach((a) => templateIds.add(a.template_id));

    const { data: permanent } = await admin
      .from("sop_templates")
      .select("id")
      .eq("karyawan_id", karyawan.id);
    permanent?.forEach((t) => {
      if (!overriddenTemplateIds.has(t.id)) templateIds.add(t.id);
    });

    if (templateIds.size === 0) continue;

    const { data: sopItems } = await admin
      .from("sop_items")
      .select("id")
      .in("template_id", [...templateIds]);

    if (!sopItems || sopItems.length === 0) continue;

    let { data: checklist } = await admin
      .from("checklist_daily")
      .select("id")
      .eq("karyawan_id", karyawan.id)
      .eq("tanggal", tanggal)
      .single();

    if (!checklist) {
      const { data: created } = await admin
        .from("checklist_daily")
        .insert({ karyawan_id: karyawan.id, tanggal, status_verif: "pending" })
        .select("id")
        .single();
      checklist = created;
    }

    if (!checklist) continue;

    await admin.from("checklist_items").delete().eq("checklist_id", checklist.id);
    await admin.from("checklist_items").insert(
      sopItems.map((si) => ({ checklist_id: checklist!.id, sop_item_id: si.id }))
    );

    count++;
  }

  revalidatePath("/checklist");
  revalidatePath("/sop");
  revalidatePath("/dashboard");
  return { success: true, data: { count } };
}
