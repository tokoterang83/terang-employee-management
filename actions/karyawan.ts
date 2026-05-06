"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { CreateKaryawanSchema, UpdateGajiPokokSchema } from "@/lib/validations";
import type { ActionResult, Profile } from "@/lib/types";

// Owner: buat akun karyawan baru via admin API
export async function createKaryawan(
  formData: FormData
): Promise<ActionResult<Profile>> {
  // Verifikasi pemanggil adalah owner menggunakan session cookie
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (ownerProfile?.role !== "owner") {
    return { success: false, error: "Hanya owner yang bisa menambah karyawan" };
  }

  const raw = {
    nama: formData.get("nama") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    gaji_pokok: Number(formData.get("gaji_pokok")),
  };

  const parsed = CreateKaryawanSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Admin client untuk buat user (butuh service role key)
  const admin = createAdminClient();
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { nama: parsed.data.nama },
  });

  if (authError || !authData.user) {
    return {
      success: false,
      error: authError?.message ?? "Gagal membuat akun karyawan",
    };
  }

  // Trigger handle_new_user sudah auto-create profile dengan role 'karyawan'
  // Update gaji_pokok via admin client karena user baru belum ada session
  const { data, error } = await admin
    .from("profiles")
    .update({ gaji_pokok: parsed.data.gaji_pokok })
    .eq("id", authData.user.id)
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: "Gagal menyimpan data karyawan" };
  }

  revalidatePath("/karyawan");
  return { success: true, data };
}

// Owner: lihat semua karyawan
export async function getKaryawanList(): Promise<ActionResult<Profile[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "karyawan")
    .order("nama");

  if (error) {
    return { success: false, error: "Gagal memuat daftar karyawan" };
  }

  return { success: true, data: data ?? [] };
}

// Owner: update gaji pokok karyawan
export async function updateGajiPokok(
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    karyawan_id: formData.get("karyawan_id") as string,
    gaji_pokok: Number(formData.get("gaji_pokok")),
  };

  const parsed = UpdateGajiPokokSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ gaji_pokok: parsed.data.gaji_pokok })
    .eq("id", parsed.data.karyawan_id);

  if (error) {
    return { success: false, error: "Gagal update gaji pokok" };
  }

  revalidatePath("/karyawan");
  return { success: true, data: undefined };
}
