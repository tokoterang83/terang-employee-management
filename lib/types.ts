// Database types sesuai schema Supabase

export type UserRole = "owner" | "karyawan";
export type ResiStatus = "Baru" | "Packing" | "Siap Kirim" | "Terkirim";
export type PesananStatus = "Diterima" | "Diproses" | "Siap" | "Selesai";
export type PesananJenis = "Satuan" | "Custom" | "Grosir";
export type GajiStatus = "Belum Bayar" | "Sudah Bayar";
export type VerifStatus = "pending" | "verified" | "rejected";

export interface Profile {
  id: string;
  nama: string;
  role: UserRole;
  gaji_pokok: number;
  created_at: string;
}

export interface SopTemplate {
  id: string;
  karyawan_id: string;
  nama_sop: string;
  sub_judul: string | null;
  deskripsi: string | null;
  created_at: string;
}

export interface SopItem {
  id: string;
  template_id: string;
  urutan: number;
  teks_item: string;
  created_at: string;
}

export interface ChecklistDaily {
  id: string;
  karyawan_id: string;
  tanggal: string;
  status_verif: VerifStatus;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  sop_item_id: string;
  is_checked: boolean;
  is_verified: boolean | null;
  point_delta: number | null;
  created_at: string;
}

export interface PointLog {
  id: string;
  karyawan_id: string;
  delta: number;
  alasan: string | null;
  tanggal: string;
  ref_checklist_id: string | null;
  created_at: string;
}

export interface ResiOnline {
  id: string;
  filename: string;
  storage_path: string;
  assigned_to: string | null;
  status: ResiStatus;
  uploaded_by: string;
  terkirim_at: string | null;
  created_at: string;
}

export interface PesananManual {
  id: string;
  nama_pemesan: string;
  kontak: string | null;
  detail: string;
  jenis: PesananJenis;
  catatan: string | null;
  status: PesananStatus;
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface GajiBulanan {
  id: string;
  karyawan_id: string;
  bulan: number;
  tahun: number;
  gaji_pokok: number;
  bonus: number;
  catatan_bonus: string | null;
  status_bayar: GajiStatus;
  dibayar_at: string | null;
  created_at: string;
}

export interface KaryawanPoints {
  id: string;
  nama: string;
  total_points: number;
}

// Server action return type
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
