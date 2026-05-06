import { z } from "zod";

// ---- Auth ----
export const LoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

// ---- Karyawan / Profile ----
export const CreateKaryawanSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  gaji_pokok: z.number().min(0, "Gaji tidak boleh negatif"),
});

export const UpdateGajiPokokSchema = z.object({
  karyawan_id: z.string().uuid(),
  gaji_pokok: z.number().min(0),
});

// ---- SOP Templates ----
export const CreateSopTemplateSchema = z.object({
  nama_sop: z.string().min(1, "Judul SOP wajib diisi"),
  sub_judul: z.string().optional().nullable(),
  deskripsi: z.string().optional().nullable(),
});

// ---- SOP Items ----
export const CreateSopItemSchema = z.object({
  template_id: z.string().uuid(),
  teks_item: z.string().min(1, "Teks item wajib diisi"),
  urutan: z.number().int().min(0).default(0),
});

// ---- Checklist ----
export const ToggleChecklistItemSchema = z.object({
  checklist_item_id: z.string().uuid(),
  is_checked: z.boolean(),
});

export const VerifyChecklistItemSchema = z.object({
  checklist_item_id: z.string().uuid(),
  is_verified: z.boolean(),
});

export const VerifyAllChecklistSchema = z.object({
  checklist_id: z.string().uuid(),
});

// ---- Resi Online ----
export const UpdateResiStatusSchema = z.object({
  resi_id: z.string().uuid(),
  status: z.enum(["Baru", "Packing", "Siap Kirim", "Terkirim"]),
});

export const AssignResiSchema = z.object({
  resi_id: z.string().uuid(),
  assigned_to: z.string().uuid().nullable(),
});

export const CreateResiSchema = z.object({
  filename: z.string().min(1),
  storage_path: z.string().min(1),
  assigned_to: z.string().uuid().nullable().optional(),
});

// ---- Pesanan Manual ----
export const CreatePesananSchema = z.object({
  nama_pemesan: z.string().min(1, "Nama pemesan wajib diisi"),
  kontak: z.string().optional().nullable(),
  detail: z.string().min(1, "Detail pesanan wajib diisi"),
  jenis: z.enum(["Satuan", "Custom", "Grosir"]),
  catatan: z.string().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
});

export const UpdatePesananStatusSchema = z.object({
  pesanan_id: z.string().uuid(),
  status: z.enum(["Diterima", "Diproses", "Siap", "Selesai"]),
});

export const UpdatePesananSchema = z.object({
  pesanan_id: z.string().uuid(),
  nama_pemesan: z.string().min(1).optional(),
  kontak: z.string().optional().nullable(),
  detail: z.string().min(1).optional(),
  jenis: z.enum(["Satuan", "Custom", "Grosir"]).optional(),
  catatan: z.string().optional().nullable(),
  status: z.enum(["Diterima", "Diproses", "Siap", "Selesai"]).optional(),
  assigned_to: z.string().uuid().optional().nullable(),
});

// ---- Gaji Bulanan ----
export const UpsertGajiSchema = z.object({
  karyawan_id: z.string().uuid(),
  bulan: z.number().int().min(1).max(12),
  tahun: z.number().int().min(2024),
  gaji_pokok: z.number().min(0),
  bonus: z.number().min(0).default(0),
  catatan_bonus: z.string().optional().nullable(),
});

export const UpdateBonusSchema = z.object({
  gaji_id: z.string().uuid(),
  bonus: z.number().min(0),
  catatan_bonus: z.string().optional().nullable(),
});

export const BayarGajiSchema = z.object({
  gaji_id: z.string().uuid(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateKaryawanInput = z.infer<typeof CreateKaryawanSchema>;
export type CreateSopTemplateInput = z.infer<typeof CreateSopTemplateSchema>;
export type CreateSopItemInput = z.infer<typeof CreateSopItemSchema>;
export type CreatePesananInput = z.infer<typeof CreatePesananSchema>;
export type UpsertGajiInput = z.infer<typeof UpsertGajiSchema>;
