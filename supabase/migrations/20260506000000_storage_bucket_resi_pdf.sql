-- ============================================================
-- MIGRATION: Storage Bucket resi-pdf + RLS Policies
-- ============================================================
-- Jalankan di: Supabase Dashboard → SQL Editor
-- Prasyarat: Migration initial_schema.sql sudah dijalankan
-- ============================================================

-- Buat bucket resi-pdf (private, max 10MB, PDF only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resi-pdf',
  'resi-pdf',
  false,
  10485760,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RLS POLICIES — storage.objects
-- ============================================================

-- Owner: upload file (INSERT)
DROP POLICY IF EXISTS "resi_pdf_owner_insert" ON storage.objects;
CREATE POLICY "resi_pdf_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'resi-pdf'
    AND private.is_owner()
  );

-- Owner: lihat semua file (SELECT)
DROP POLICY IF EXISTS "resi_pdf_owner_select" ON storage.objects;
CREATE POLICY "resi_pdf_owner_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'resi-pdf'
    AND private.is_owner()
  );

-- Owner: update metadata file
DROP POLICY IF EXISTS "resi_pdf_owner_update" ON storage.objects;
CREATE POLICY "resi_pdf_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'resi-pdf' AND private.is_owner())
  WITH CHECK (bucket_id = 'resi-pdf' AND private.is_owner());

-- Owner: hapus file
DROP POLICY IF EXISTS "resi_pdf_owner_delete" ON storage.objects;
CREATE POLICY "resi_pdf_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'resi-pdf'
    AND private.is_owner()
  );

-- Karyawan: hanya bisa download resi yang di-assign ke dirinya
DROP POLICY IF EXISTS "resi_pdf_karyawan_select" ON storage.objects;
CREATE POLICY "resi_pdf_karyawan_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'resi-pdf'
    AND EXISTS (
      SELECT 1 FROM public.resi_online
      WHERE storage_path = name
        AND assigned_to = auth.uid()
    )
  );
