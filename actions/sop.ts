"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import {
  CreateSopTemplateSchema,
  CreateSopItemSchema,
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

  // Hapus assignment lama dulu (harus selesai sebelum insert baru)
  await admin
    .from("sop_daily_assignments")
    .delete()
    .eq("karyawan_id", karyawanId)
    .eq("tanggal", tanggal);

  // Insert assignment baru + ambil sop_items secara paralel (keduanya independen)
  const [, sopItemsResult] = await Promise.all([
    templateIds.length > 0
      ? admin.from("sop_daily_assignments").insert(
          templateIds.map((tid) => ({ template_id: tid, karyawan_id: karyawanId, tanggal }))
        )
      : Promise.resolve(null),
    templateIds.length > 0
      ? admin.from("sop_items").select("id").in("template_id", templateIds)
      : Promise.resolve({ data: [] as { id: string }[] }),
  ]);

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
