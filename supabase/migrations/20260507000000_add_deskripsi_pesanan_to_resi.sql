-- ============================================================
-- MIGRATION: Tambah kolom deskripsi_pesanan di resi_online
-- ============================================================
-- Tujuan: Owner bisa tulis keterangan isi pesanan (item buku)
-- saat upload resi, karyawan bisa baca sebelum packing
-- ============================================================

ALTER TABLE public.resi_online
  ADD COLUMN IF NOT EXISTS deskripsi_pesanan text;

COMMENT ON COLUMN public.resi_online.deskripsi_pesanan IS
  'Keterangan isi pesanan (nama buku, jumlah, dll) yang diisi Owner saat upload resi';
