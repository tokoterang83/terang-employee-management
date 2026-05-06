-- Tambah kolom sub_judul dan deskripsi ke sop_templates
ALTER TABLE public.sop_templates
  ADD COLUMN IF NOT EXISTS sub_judul text,
  ADD COLUMN IF NOT EXISTS deskripsi text;
