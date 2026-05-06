"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import {
  CreatePesananSchema,
  UpdatePesananStatusSchema,
  UpdatePesananSchema,
} from "@/lib/validations";
import type { ActionResult, PesananManual } from "@/lib/types";

// Owner & Karyawan: buat pesanan baru
export async function createPesanan(
  formData: FormData
): Promise<ActionResult<PesananManual>> {
  const raw = {
    nama_pemesan: formData.get("nama_pemesan") as string,
    kontak: (formData.get("kontak") as string) || null,
    detail: formData.get("detail") as string,
    jenis: formData.get("jenis") as string,
    catatan: (formData.get("catatan") as string) || null,
    assigned_to: (formData.get("assigned_to") as string) || null,
  };

  const parsed = CreatePesananSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  const { data, error } = await supabase
    .from("pesanan_manual")
    .insert({ ...parsed.data, created_by: user.id })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: "Gagal menyimpan pesanan" };
  }

  revalidatePath("/pesanan");
  revalidatePath("/dashboard");
  return { success: true, data };
}

// Update status pesanan (karyawan: hanya pesanan miliknya/ditugaskan; owner: semua)
export async function updatePesananStatus(
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    pesanan_id: formData.get("pesanan_id") as string,
    status: formData.get("status") as string,
  };

  const parsed = UpdatePesananStatusSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("pesanan_manual")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.pesanan_id);

  if (error) {
    return { success: false, error: "Gagal update status pesanan" };
  }

  revalidatePath("/pesanan");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

// Owner: edit pesanan (semua field)
export async function updatePesanan(formData: FormData): Promise<ActionResult> {
  const raw = {
    pesanan_id: formData.get("pesanan_id") as string,
    nama_pemesan: (formData.get("nama_pemesan") as string) || undefined,
    kontak: (formData.get("kontak") as string) || null,
    detail: (formData.get("detail") as string) || undefined,
    jenis: (formData.get("jenis") as string) || undefined,
    catatan: (formData.get("catatan") as string) || null,
    status: (formData.get("status") as string) || undefined,
    assigned_to: (formData.get("assigned_to") as string) || null,
  };

  const parsed = UpdatePesananSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { pesanan_id, ...updates } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("pesanan_manual")
    .update(updates)
    .eq("id", pesanan_id);

  if (error) {
    return { success: false, error: "Gagal update pesanan" };
  }

  revalidatePath("/pesanan");
  return { success: true, data: undefined };
}

// Owner: hapus pesanan
export async function deletePesanan(pesananId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("pesanan_manual")
    .delete()
    .eq("id", pesananId);

  if (error) {
    return { success: false, error: "Gagal hapus pesanan" };
  }

  revalidatePath("/pesanan");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

// Semua user: lihat semua pesanan (transparansi operasional)
export async function getAllPesanan(filters?: {
  status?: string;
  jenis?: string;
  created_by?: string;
}): Promise<
  ActionResult<
    (PesananManual & { profiles: { nama: string } | null })[]
  >
> {
  const supabase = await createClient();
  let query = supabase
    .from("pesanan_manual")
    .select("*, profiles!pesanan_manual_created_by_fkey(nama)")
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.jenis) query = query.eq("jenis", filters.jenis);
  if (filters?.created_by) query = query.eq("created_by", filters.created_by);

  const { data, error } = await query;

  if (error) {
    return { success: false, error: "Gagal memuat pesanan" };
  }

  return { success: true, data: (data ?? []) as typeof data & [] };
}
