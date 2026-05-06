-- Buat karyawan_id nullable agar SOP bisa tanpa default anggota
ALTER TABLE public.sop_templates
  ALTER COLUMN karyawan_id DROP NOT NULL;

-- Tabel assignment SOP harian
CREATE TABLE IF NOT EXISTS public.sop_daily_assignments (
  template_id  uuid NOT NULL REFERENCES public.sop_templates(id) ON DELETE CASCADE,
  karyawan_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tanggal      date NOT NULL DEFAULT CURRENT_DATE,
  PRIMARY KEY (template_id, tanggal)
);

CREATE INDEX IF NOT EXISTS idx_sop_daily_assignments_karyawan_tgl
  ON public.sop_daily_assignments(karyawan_id, tanggal);

-- RLS
ALTER TABLE public.sop_daily_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sop_daily_assignments_owner_all" ON public.sop_daily_assignments
  FOR ALL USING (private.is_owner()) WITH CHECK (private.is_owner());

CREATE POLICY "sop_daily_assignments_karyawan_select" ON public.sop_daily_assignments
  FOR SELECT USING (karyawan_id = auth.uid());

-- Update trigger: pakai daily assignment jika ada, fallback ke karyawan_id permanen
CREATE OR REPLACE FUNCTION public.populate_checklist_items()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.checklist_items (checklist_id, sop_item_id)
  SELECT NEW.id, si.id
  FROM public.sop_templates st
  JOIN public.sop_items si ON si.template_id = st.id
  WHERE (
    -- Ada daily assignment untuk anggota ini hari ini
    EXISTS (
      SELECT 1 FROM public.sop_daily_assignments sda
      WHERE sda.template_id = st.id
        AND sda.karyawan_id = NEW.karyawan_id
        AND sda.tanggal = NEW.tanggal
    )
    OR
    -- Fallback: karyawan_id permanen, tapi hanya jika tidak ada daily assignment sama sekali untuk SOP ini hari ini
    (
      st.karyawan_id = NEW.karyawan_id
      AND NOT EXISTS (
        SELECT 1 FROM public.sop_daily_assignments sda
        WHERE sda.template_id = st.id
          AND sda.tanggal = NEW.tanggal
      )
    )
  )
  ORDER BY st.created_at, si.urutan;
  RETURN NEW;
END;
$$;
