-- Fix primary key sop_daily_assignments: 1 SOP bisa untuk banyak karyawan di hari yang sama
ALTER TABLE public.sop_daily_assignments DROP CONSTRAINT IF EXISTS sop_daily_assignments_pkey;
ALTER TABLE public.sop_daily_assignments ADD PRIMARY KEY (template_id, karyawan_id, tanggal);
