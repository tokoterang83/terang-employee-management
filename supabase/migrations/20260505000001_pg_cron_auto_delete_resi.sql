-- ============================================================
-- MIGRATION: pg_cron Auto-Delete Resi Terkirim (4 hari)
-- ============================================================
-- Jalankan ini di Supabase SQL Editor setelah:
-- 1. Aktifkan ekstensi pg_cron di Supabase Dashboard
--    (Database → Extensions → cron → Enable)
-- 2. Pastikan bucket Storage "resi-pdf" sudah dibuat di Storage tab
-- ============================================================

-- pg_cron sudah aktif di Supabase (diaktifkan via Dashboard Extensions)
-- Fungsi yang dijalankan oleh cron: hapus resi Terkirim >= 4 hari
CREATE OR REPLACE FUNCTION public.auto_delete_resi_terkirim()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  resi_row RECORD;
BEGIN
  FOR resi_row IN
    SELECT id, storage_path
    FROM public.resi_online
    WHERE status = 'Terkirim'
      AND terkirim_at <= now() - interval '4 days'
  LOOP
    -- Hapus file dari storage.objects (Supabase internal trigger → hapus file S3)
    DELETE FROM storage.objects
    WHERE bucket_id = 'resi-pdf' AND name = resi_row.storage_path;

    -- Hapus record resi dari database
    DELETE FROM public.resi_online WHERE id = resi_row.id;
  END LOOP;
END;
$$;

-- Daftarkan cron job: jalankan tiap hari pukul 02:00 WIB (UTC+7 → 19:00 UTC)
SELECT cron.schedule(
  'auto-delete-resi-terkirim',   -- nama job (unik)
  '0 19 * * *',                  -- setiap hari 19:00 UTC = 02:00 WIB
  $$SELECT public.auto_delete_resi_terkirim()$$
);
