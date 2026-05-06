"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import {
  UpsertGajiSchema,
  UpdateBonusSchema,
  BayarGajiSchema,
} from "@/lib/validations";
import type {
  ActionResult,
  GajiBulanan,
  KaryawanPoints,
  PointLog,
} from "@/lib/types";

// Owner: buat atau update rekap gaji bulan tertentu
export async function upsertGaji(
  formData: FormData
): Promise<ActionResult<GajiBulanan>> {
  const raw = {
    karyawan_id: formData.get("karyawan_id") as string,
    bulan: Number(formData.get("bulan")),
    tahun: Number(formData.get("tahun")),
    gaji_pokok: Number(formData.get("gaji_pokok")),
    bonus: Number(formData.get("bonus") ?? 0),
    catatan_bonus: (formData.get("catatan_bonus") as string) || null,
  };

  const parsed = UpsertGajiSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gaji_bulanan")
    .upsert(parsed.data, { onConflict: "karyawan_id,bulan,tahun" })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: "Gagal simpan data gaji" };
  }

  revalidatePath("/gaji");
  return { success: true, data };
}

// Owner: update bonus saja
export async function updateBonus(formData: FormData): Promise<ActionResult> {
  const raw = {
    gaji_id: formData.get("gaji_id") as string,
    bonus: Number(formData.get("bonus")),
    catatan_bonus: (formData.get("catatan_bonus") as string) || null,
  };

  const parsed = UpdateBonusSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("gaji_bulanan")
    .update({
      bonus: parsed.data.bonus,
      catatan_bonus: parsed.data.catatan_bonus,
    })
    .eq("id", parsed.data.gaji_id);

  if (error) {
    return { success: false, error: "Gagal update bonus" };
  }

  revalidatePath("/gaji");
  return { success: true, data: undefined };
}

// Owner: tandai gaji sebagai Sudah Bayar
export async function bayarGaji(formData: FormData): Promise<ActionResult> {
  const raw = { gaji_id: formData.get("gaji_id") as string };
  const parsed = BayarGajiSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("gaji_bulanan")
    .update({
      status_bayar: "Sudah Bayar",
      dibayar_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.gaji_id);

  if (error) {
    return { success: false, error: "Gagal update status pembayaran" };
  }

  revalidatePath("/gaji");
  revalidatePath("/profil");
  return { success: true, data: undefined };
}

// Owner: lihat rekap gaji semua karyawan bulan tertentu
export async function getGajiByBulan(
  bulan: number,
  tahun: number
): Promise<
  ActionResult<(GajiBulanan & { profiles: { nama: string } | null })[]>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gaji_bulanan")
    .select("*, profiles(nama)")
    .eq("bulan", bulan)
    .eq("tahun", tahun)
    .order("created_at");

  if (error) {
    return { success: false, error: "Gagal memuat data gaji" };
  }

  return { success: true, data: (data ?? []) as typeof data & [] };
}

// Karyawan: lihat histori gaji miliknya (hanya yang Sudah Bayar — RLS)
export async function getMyGajiHistory(): Promise<ActionResult<GajiBulanan[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gaji_bulanan")
    .select("*")
    .order("tahun", { ascending: false })
    .order("bulan", { ascending: false });

  if (error) {
    return { success: false, error: "Gagal memuat histori gaji" };
  }

  return { success: true, data: data ?? [] };
}

// Owner: lihat total & histori poin semua karyawan
export async function getAllKaryawanPoints(): Promise<
  ActionResult<KaryawanPoints[]>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("karyawan_points")
    .select("*")
    .order("nama");

  if (error) {
    return { success: false, error: "Gagal memuat data poin" };
  }

  return { success: true, data: data ?? [] };
}

// Karyawan: lihat total poin sendiri
export async function getMyPoints(): Promise<ActionResult<number>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  const { data, error } = await supabase
    .from("karyawan_points")
    .select("total_points")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return { success: false, error: "Gagal memuat poin" };
  }

  return { success: true, data: data.total_points };
}

// Karyawan & Owner: lihat histori poin
export async function getPointHistory(
  karyawanId?: string
): Promise<ActionResult<PointLog[]>> {
  const supabase = await createClient();

  let query = supabase
    .from("point_log")
    .select("*")
    .order("tanggal", { ascending: false })
    .limit(100);

  // Jika karyawanId disediakan (Owner lihat karyawan tertentu), filter
  // Jika tidak, RLS otomatis filter ke milik sendiri (karyawan)
  if (karyawanId) {
    query = query.eq("karyawan_id", karyawanId);
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, error: "Gagal memuat histori poin" };
  }

  return { success: true, data: data ?? [] };
}
