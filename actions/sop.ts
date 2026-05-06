"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import {
  CreateSopTemplateSchema,
  UpdateSopTemplateSchema,
  CreateSopItemSchema,
  UpdateSopItemSchema,
} from "@/lib/validations";
import type { ActionResult, SopItem, SopTemplate } from "@/lib/types";

// Owner: buat SOP template baru untuk karyawan
export async function createSopTemplate(
  formData: FormData
): Promise<ActionResult<SopTemplate>> {
  const raw = {
    karyawan_id: formData.get("karyawan_id") as string,
    nama_sop: formData.get("nama_sop") as string,
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
