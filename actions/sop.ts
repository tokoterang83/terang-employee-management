"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import {
  CreateSopTemplateSchema,
  UpdateSopTemplateSchema,
  CreateSopItemSchema,
  UpdateSopItemSchema,
} from "@/lib/validations";
import { createAdminClient } from "@/utils/supabase/admin";
import type { ActionResult, SopItem, SopTemplate } from "@/lib/types";

// Owner: buat SOP template baru untuk karyawan
export async function createSopTemplate(
  formData: FormData
): Promise<ActionResult<SopTemplate>> {
  const raw = {
    nama_sop: formData.get("nama_sop") as string,
    sub_judul: (formData.get("sub_judul") as string) || null,
    deskripsi: (formData.get("deskripsi") as string) || null,
  };

  const parsed = CreateSopTemplateSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sop_templates")
    .insert(parsed.data)
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: "Gagal membuat SOP template" };
  }

  revalidatePath("/sop");
  revalidatePath("/checklist");
  return { success: true, data };
}

// Owner: update nama SOP template
export async function updateSopTemplate(
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    id: formData.get("id") as string,
    nama_sop: formData.get("nama_sop") as string,
  };

  const parsed = UpdateSopTemplateSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("sop_templates")
    .update({ nama_sop: parsed.data.nama_sop })
    .eq("id", parsed.data.id);

  if (error) {
    return { success: false, error: "Gagal update SOP template" };
  }

  revalidatePath("/sop");
  return { success: true, data: undefined };
}

// Owner: hapus SOP template (cascade ke sop_items)
export async function deleteSopTemplate(
  templateId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("sop_templates")
    .delete()
    .eq("id", templateId);

  if (error) {
    return { success: false, error: "Gagal hapus SOP template" };
  }

  revalidatePath("/sop");
  revalidatePath("/checklist");
  return { success: true, data: undefined };
}

// Owner: tambah item ke SOP template
export async function createSopItem(
  formData: FormData
): Promise<ActionResult<SopItem>> {
  const raw = {
    template_id: formData.get("template_id") as string,
    teks_item: formData.get("teks_item") as string,
    urutan: Number(formData.get("urutan") ?? 0),
  };

  const parsed = CreateSopItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sop_items")
    .insert(parsed.data)
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: "Gagal menambah item SOP" };
  }

  revalidatePath("/sop");
  return { success: true, data };
}

// Owner: update teks/urutan item SOP
export async function updateSopItem(
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    id: formData.get("id") as string,
    teks_item: formData.get("teks_item") as string,
    urutan: formData.get("urutan") ? Number(formData.get("urutan")) : undefined,
  };

  const parsed = UpdateSopItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { id, ...updates } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("sop_items")
    .update(updates)
    .eq("id", id);

  if (error) {
    return { success: false, error: "Gagal update item SOP" };
  }

  revalidatePath("/sop");
  return { success: true, data: undefined };
}

// Owner: hapus item SOP
export async function deleteSopItem(itemId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("sop_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    return { success: false, error: "Gagal hapus item SOP" };
  }

  revalidatePath("/sop");
  return { success: true, data: undefined };
}

// Owner: upsert daily assignment (siapa yang dapat SOP ini hari ini)
export async function upsertSopDailyAssignment(
  templateId: string,
  karyawanId: string | null,
  tanggal: string
): Promise<ActionResult> {
  const supabase = await createClient();

  if (!karyawanId) {
    const { error } = await supabase
      .from("sop_daily_assignments")
      .delete()
      .eq("template_id", templateId)
      .eq("tanggal", tanggal);
    if (error) return { success: false, error: "Gagal hapus assignment" };
    revalidatePath("/sop");
    return { success: true, data: undefined };
  }

  const { error } = await supabase
    .from("sop_daily_assignments")
    .upsert({ template_id: templateId, karyawan_id: karyawanId, tanggal }, { onConflict: "template_id,tanggal" });

  if (error) return { success: false, error: "Gagal simpan assignment" };
  revalidatePath("/sop");
  return { success: true, data: undefined };
}

// Owner: ambil semua daily assignments untuk tanggal tertentu
export async function getSopDailyAssignments(
  tanggal: string
): Promise<ActionResult<{ template_id: string; karyawan_id: string }[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sop_daily_assignments")
    .select("template_id, karyawan_id")
    .eq("tanggal", tanggal);

  if (error) return { success: false, error: "Gagal memuat assignments" };
  return { success: true, data: data ?? [] };
}

// Karyawan: lihat SOP miliknya (dengan items)
export async function getMySopTemplates(): Promise<
  ActionResult<(SopTemplate & { sop_items: SopItem[] })[]>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sop_templates")
    .select("*, sop_items(id, urutan, teks_item, created_at, template_id)")
    .order("created_at")
    .order("urutan", { referencedTable: "sop_items" });

  if (error) {
    return { success: false, error: "Gagal memuat SOP" };
  }

  return { success: true, data: data ?? [] };
}

// Owner: lihat SOP karyawan tertentu (dengan items)
export async function getSopByKaryawan(
  karyawanId: string
): Promise<ActionResult<(SopTemplate & { sop_items: SopItem[] })[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sop_templates")
    .select("*, sop_items(id, urutan, teks_item, created_at, template_id)")
    .eq("karyawan_id", karyawanId)
    .order("created_at")
    .order("urutan", { referencedTable: "sop_items" });

  if (error) {
    return { success: false, error: "Gagal memuat SOP" };
  }

  return { success: true, data: data ?? [] };
}

// Owner: ambil assignment SOP untuk karyawan tertentu di tanggal tertentu
export async function getAssignmentsByKaryawan(
  karyawanId: string,
  tanggal: string
): Promise<ActionResult<string[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sop_daily_assignments")
    .select("template_id")
    .eq("karyawan_id", karyawanId)
    .eq("tanggal", tanggal);

  if (error) return { success: false, error: "Gagal memuat assignment" };
  return { success: true, data: (data ?? []).map((d) => d.template_id) };
}

// Owner: assign SOP ke karyawan untuk tanggal tertentu + siapkan checklist
export async function assignSopsToKaryawan(
  karyawanId: string,
  templateIds: string[],
  tanggal: string
): Promise<ActionResult<{ count: number }>> {
  const admin = createAdminClient();

  // Hapus assignment lama untuk karyawan ini di tanggal ini
  await admin
    .from("sop_daily_assignments")
    .delete()
    .eq("karyawan_id", karyawanId)
    .eq("tanggal", tanggal);

  // Insert assignment baru
  if (templateIds.length > 0) {
    await admin.from("sop_daily_assignments").insert(
      templateIds.map((tid) => ({ template_id: tid, karyawan_id: karyawanId, tanggal }))
    );
  }

  // Ambil sop_items dari template yang dipilih
  const sopItemsResult =
    templateIds.length > 0
      ? await admin.from("sop_items").select("id").in("template_id", templateIds)
      : { data: [] };

  const sopItems = sopItemsResult.data ?? [];

  // Get or create checklist_daily
  let { data: checklist } = await admin
    .from("checklist_daily")
    .select("id")
    .eq("karyawan_id", karyawanId)
    .eq("tanggal", tanggal)
    .single();

  if (!checklist && sopItems.length > 0) {
    const { data: created } = await admin
      .from("checklist_daily")
      .insert({ karyawan_id: karyawanId, tanggal, status_verif: "pending" })
      .select("id")
      .single();
    checklist = created;
  }

  if (checklist) {
    // Reset dan isi ulang items
    await admin.from("checklist_items").delete().eq("checklist_id", checklist.id);
    if (sopItems.length > 0) {
      await admin.from("checklist_items").insert(
        sopItems.map((si) => ({ checklist_id: checklist!.id, sop_item_id: si.id }))
      );
    }
  }

  revalidatePath("/checklist");
  revalidatePath("/sop");
  revalidatePath("/dashboard");
  return { success: true, data: { count: templateIds.length } };
}
