"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import {
  UpdateResiStatusSchema,
  AssignResiSchema,
  CreateResiSchema,
} from "@/lib/validations";
import type { ActionResult, ResiOnline } from "@/lib/types";

// Owner: buat record resi setelah upload PDF ke Storage
export async function createResi(
  formData: FormData
): Promise<ActionResult<ResiOnline>> {
  const raw = {
    filename: formData.get("filename") as string,
    storage_path: formData.get("storage_path") as string,
    assigned_to: (formData.get("assigned_to") as string) || null,
  };

  const parsed = CreateResiSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  const { data, error } = await supabase
    .from("resi_online")
    .insert({ ...parsed.data, uploaded_by: user.id })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: "Gagal menyimpan data resi" };
  }

  revalidatePath("/resi");
  revalidatePath("/dashboard");
  return { success: true, data };
}

// Owner: assign resi ke karyawan
export async function assignResi(formData: FormData): Promise<ActionResult> {
  const raw = {
    resi_id: formData.get("resi_id") as string,
    assigned_to: (formData.get("assigned_to") as string) || null,
  };

  const parsed = AssignResiSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("resi_online")
    .update({ assigned_to: parsed.data.assigned_to })
    .eq("id", parsed.data.resi_id);

  if (error) {
    return { success: false, error: "Gagal assign resi" };
  }

  revalidatePath("/resi");
  return { success: true, data: undefined };
}

// Karyawan: update status resi miliknya
// Trigger DB auto-set terkirim_at saat status = 'Terkirim'
export async function updateResiStatus(
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    resi_id: formData.get("resi_id") as string,
    status: formData.get("status") as string,
  };

  const parsed = UpdateResiStatusSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("resi_online")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.resi_id);

  if (error) {
    return { success: false, error: "Gagal update status resi" };
  }

  revalidatePath("/resi");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

// Owner: lihat semua resi
export async function getAllResi(): Promise<
  ActionResult<(ResiOnline & { profiles: { nama: string } | null })[]>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resi_online")
    .select("*, profiles!resi_online_assigned_to_fkey(nama)")
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: "Gagal memuat data resi" };
  }

  return { success: true, data: (data ?? []) as typeof data & [] };
}

// Karyawan: lihat resi yang di-assign ke saya
export async function getMyResi(): Promise<ActionResult<ResiOnline[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resi_online")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: "Gagal memuat resi" };
  }

  return { success: true, data: data ?? [] };
}

// Owner: hapus resi (dan file di Storage)
export async function deleteResi(resiId: string): Promise<ActionResult> {
  const supabase = await createClient();

  // Ambil storage_path dulu sebelum hapus
  const { data: resi } = await supabase
    .from("resi_online")
    .select("storage_path")
    .eq("id", resiId)
    .single();

  if (resi?.storage_path) {
    await supabase.storage.from("resi-pdf").remove([resi.storage_path]);
  }

  const { error } = await supabase
    .from("resi_online")
    .delete()
    .eq("id", resiId);

  if (error) {
    return { success: false, error: "Gagal hapus resi" };
  }

  revalidatePath("/resi");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

// Ambil signed URL untuk download PDF resi
export async function getResiDownloadUrl(
  storagePath: string
): Promise<ActionResult<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("resi-pdf")
    .createSignedUrl(storagePath, 60 * 60); // 1 jam

  if (error || !data) {
    return { success: false, error: "Gagal membuat link download" };
  }

  return { success: true, data: data.signedUrl };
}
