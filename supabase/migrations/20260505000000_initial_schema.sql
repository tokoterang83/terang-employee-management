-- ============================================================
-- MIGRATION: Initial Schema
-- Toko Buku dan Kitab Terang — Employee Management App
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('owner', 'karyawan');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.resi_status AS ENUM ('Baru', 'Packing', 'Siap Kirim', 'Terkirim');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.pesanan_status AS ENUM ('Diterima', 'Diproses', 'Siap', 'Selesai');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.pesanan_jenis AS ENUM ('Satuan', 'Custom', 'Grosir');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.gaji_status AS ENUM ('Belum Bayar', 'Sudah Bayar');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.verif_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama       text        NOT NULL,
  role       public.user_role NOT NULL DEFAULT 'karyawan',
  gaji_pokok numeric(12,2)   NOT NULL DEFAULT 0,
  created_at timestamptz     NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.profiles IS 'Data karyawan & owner, extend dari auth.users';

-- SOP Templates (per karyawan)
CREATE TABLE IF NOT EXISTS public.sop_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  karyawan_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nama_sop    text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.sop_templates IS 'Template SOP yang dibuat Owner untuk tiap karyawan';

-- SOP Items (isi checklist dalam template)
CREATE TABLE IF NOT EXISTS public.sop_items (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid    NOT NULL REFERENCES public.sop_templates(id) ON DELETE CASCADE,
  urutan      integer NOT NULL DEFAULT 0,
  teks_item   text    NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.sop_items IS 'Item-item checklist di dalam tiap SOP template';

-- Checklist harian (header — satu record per karyawan per hari)
CREATE TABLE IF NOT EXISTS public.checklist_daily (
  id           uuid                 PRIMARY KEY DEFAULT gen_random_uuid(),
  karyawan_id  uuid                 NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tanggal      date                 NOT NULL DEFAULT CURRENT_DATE,
  status_verif public.verif_status  NOT NULL DEFAULT 'pending',
  verified_at  timestamptz,
  verified_by  uuid                 REFERENCES public.profiles(id),
  created_at   timestamptz          NOT NULL DEFAULT now(),
  UNIQUE(karyawan_id, tanggal)
);
COMMENT ON TABLE public.checklist_daily IS 'Checklist harian per karyawan. status_verif=pending sampai Owner verifikasi malam';

-- Checklist items (detail tiap item per hari)
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id           uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id uuid    NOT NULL REFERENCES public.checklist_daily(id) ON DELETE CASCADE,
  sop_item_id  uuid    NOT NULL REFERENCES public.sop_items(id) ON DELETE CASCADE,
  is_checked   boolean NOT NULL DEFAULT false,
  is_verified  boolean,      -- NULL=belum review, TRUE=verif(+1), FALSE=tolak(-1)
  point_delta  integer,      -- diisi otomatis oleh trigger saat is_verified di-set
  created_at   timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.checklist_items IS 'Item checklist harian. is_verified diset Owner, trigger auto-isi point_delta';

-- Point log (histori pergerakan poin)
CREATE TABLE IF NOT EXISTS public.point_log (
  id               uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  karyawan_id      uuid    NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  delta            integer NOT NULL,
  alasan           text,
  tanggal          date    NOT NULL DEFAULT CURRENT_DATE,
  ref_checklist_id uuid    REFERENCES public.checklist_items(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.point_log IS 'Histori poin akumulatif karyawan. Tidak pernah direset';

-- Resi Online (PDF Shopee/TikTok)
CREATE TABLE IF NOT EXISTS public.resi_online (
  id           uuid                PRIMARY KEY DEFAULT gen_random_uuid(),
  filename     text                NOT NULL,
  storage_path text                NOT NULL,
  assigned_to  uuid                REFERENCES public.profiles(id) ON DELETE SET NULL,
  status       public.resi_status  NOT NULL DEFAULT 'Baru',
  uploaded_by  uuid                NOT NULL REFERENCES public.profiles(id),
  terkirim_at  timestamptz,        -- diisi otomatis saat status -> Terkirim
  created_at   timestamptz         NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.resi_online IS 'Resi PDF dari marketplace. terkirim_at diisi trigger, dipakai cron auto-delete 4 hari';

-- Pesanan Manual (WA/telepon/langsung)
CREATE TABLE IF NOT EXISTS public.pesanan_manual (
  id           uuid                   PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_pemesan text                   NOT NULL,
  kontak       text,
  detail       text                   NOT NULL,
  jenis        public.pesanan_jenis   NOT NULL,
  catatan      text,
  status       public.pesanan_status  NOT NULL DEFAULT 'Diterima',
  created_by   uuid                   NOT NULL REFERENCES public.profiles(id),
  assigned_to  uuid                   REFERENCES public.profiles(id),
  created_at   timestamptz            NOT NULL DEFAULT now(),
  updated_at   timestamptz            NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.pesanan_manual IS 'Pesanan masuk via WA/telepon/langsung. Bisa dibuat Owner & karyawan';

-- Gaji Bulanan
CREATE TABLE IF NOT EXISTS public.gaji_bulanan (
  id            uuid               PRIMARY KEY DEFAULT gen_random_uuid(),
  karyawan_id   uuid               NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bulan         integer            NOT NULL CHECK (bulan BETWEEN 1 AND 12),
  tahun         integer            NOT NULL CHECK (tahun >= 2024),
  gaji_pokok    numeric(12,2)      NOT NULL DEFAULT 0,
  bonus         numeric(12,2)      NOT NULL DEFAULT 0,
  catatan_bonus text,
  status_bayar  public.gaji_status NOT NULL DEFAULT 'Belum Bayar',
  dibayar_at    timestamptz,
  created_at    timestamptz        NOT NULL DEFAULT now(),
  UNIQUE(karyawan_id, bulan, tahun)
);
COMMENT ON TABLE public.gaji_bulanan IS 'Rekap gaji & bonus per bulan per karyawan. Karyawan hanya bisa lihat yang Sudah Bayar';

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_sop_templates_karyawan    ON public.sop_templates(karyawan_id);
CREATE INDEX IF NOT EXISTS idx_sop_items_template_urutan ON public.sop_items(template_id, urutan);
CREATE INDEX IF NOT EXISTS idx_checklist_daily_kar_tgl   ON public.checklist_daily(karyawan_id, tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist ON public.checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_point_log_karyawan_tgl    ON public.point_log(karyawan_id, tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_resi_online_assigned      ON public.resi_online(assigned_to);
CREATE INDEX IF NOT EXISTS idx_resi_online_status        ON public.resi_online(status);
CREATE INDEX IF NOT EXISTS idx_resi_online_terkirim      ON public.resi_online(terkirim_at) WHERE status = 'Terkirim';
CREATE INDEX IF NOT EXISTS idx_pesanan_manual_status     ON public.pesanan_manual(status);
CREATE INDEX IF NOT EXISTS idx_pesanan_manual_created_by ON public.pesanan_manual(created_by);
CREATE INDEX IF NOT EXISTS idx_gaji_bulanan_karyawan     ON public.gaji_bulanan(karyawan_id, tahun DESC, bulan DESC);

-- ============================================================
-- PRIVATE SCHEMA (fungsi helper — tidak terekspos ke API)
-- ============================================================
CREATE SCHEMA IF NOT EXISTS private;

-- Helper: cek apakah user saat ini adalah Owner
CREATE OR REPLACE FUNCTION private.is_owner()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'owner'
  );
$$;

-- ============================================================
-- TRIGGER FUNCTIONS
-- ============================================================

-- 1. Auto-create profile saat user baru daftar via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, nama, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama', split_part(NEW.email, '@', 1)),
    'karyawan'
  );
  RETURN NEW;
END;
$$;

-- 2. Auto-populate checklist_items dari SOP karyawan saat checklist_daily dibuat
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
  WHERE st.karyawan_id = NEW.karyawan_id
  ORDER BY st.created_at, si.urutan;
  RETURN NEW;
END;
$$;

-- 3. Auto-set terkirim_at saat resi status berubah jadi 'Terkirim'
CREATE OR REPLACE FUNCTION public.set_resi_terkirim_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'Terkirim' AND (OLD.status IS DISTINCT FROM 'Terkirim') THEN
    NEW.terkirim_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Auto-log poin saat Owner memverifikasi/menolak item checklist
CREATE OR REPLACE FUNCTION public.log_verification_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_karyawan_id uuid;
BEGIN
  -- Hanya trigger saat is_verified berubah dari NULL ke nilai apapun
  IF OLD.is_verified IS NULL AND NEW.is_verified IS NOT NULL THEN
    SELECT cd.karyawan_id INTO v_karyawan_id
    FROM public.checklist_daily cd
    WHERE cd.id = NEW.checklist_id;

    IF NEW.is_verified = true THEN
      NEW.point_delta := 1;
      INSERT INTO public.point_log (karyawan_id, delta, alasan, ref_checklist_id)
      VALUES (v_karyawan_id, 1, 'Item SOP diverifikasi', NEW.id);
    ELSE
      NEW.point_delta := -1;
      INSERT INTO public.point_log (karyawan_id, delta, alasan, ref_checklist_id)
      VALUES (v_karyawan_id, -1, 'Item SOP ditolak', NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 5. Auto-update updated_at di pesanan_manual
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_checklist_daily_created ON public.checklist_daily;
CREATE TRIGGER on_checklist_daily_created
  AFTER INSERT ON public.checklist_daily
  FOR EACH ROW EXECUTE FUNCTION public.populate_checklist_items();

DROP TRIGGER IF EXISTS track_resi_terkirim ON public.resi_online;
CREATE TRIGGER track_resi_terkirim
  BEFORE UPDATE ON public.resi_online
  FOR EACH ROW EXECUTE FUNCTION public.set_resi_terkirim_at();

DROP TRIGGER IF EXISTS on_checklist_item_verified ON public.checklist_items;
CREATE TRIGGER on_checklist_item_verified
  BEFORE UPDATE ON public.checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.log_verification_points();

DROP TRIGGER IF EXISTS set_pesanan_updated_at ON public.pesanan_manual;
CREATE TRIGGER set_pesanan_updated_at
  BEFORE UPDATE ON public.pesanan_manual
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sop_templates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sop_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_daily  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resi_online    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesanan_manual ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gaji_bulanan   ENABLE ROW LEVEL SECURITY;

-- ---- profiles ----
DROP POLICY IF EXISTS "profiles_owner_all"    ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_select"  ON public.profiles;

CREATE POLICY "profiles_owner_all" ON public.profiles
  FOR ALL USING (private.is_owner()) WITH CHECK (private.is_owner());

CREATE POLICY "profiles_self_select" ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- ---- sop_templates ----
DROP POLICY IF EXISTS "sop_templates_owner_all"       ON public.sop_templates;
DROP POLICY IF EXISTS "sop_templates_karyawan_select" ON public.sop_templates;

CREATE POLICY "sop_templates_owner_all" ON public.sop_templates
  FOR ALL USING (private.is_owner()) WITH CHECK (private.is_owner());

CREATE POLICY "sop_templates_karyawan_select" ON public.sop_templates
  FOR SELECT USING (karyawan_id = auth.uid());

-- ---- sop_items ----
DROP POLICY IF EXISTS "sop_items_owner_all"       ON public.sop_items;
DROP POLICY IF EXISTS "sop_items_karyawan_select" ON public.sop_items;

CREATE POLICY "sop_items_owner_all" ON public.sop_items
  FOR ALL USING (private.is_owner()) WITH CHECK (private.is_owner());

CREATE POLICY "sop_items_karyawan_select" ON public.sop_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sop_templates st
      WHERE st.id = template_id AND st.karyawan_id = auth.uid()
    )
  );

-- ---- checklist_daily ----
DROP POLICY IF EXISTS "checklist_daily_owner_all"       ON public.checklist_daily;
DROP POLICY IF EXISTS "checklist_daily_karyawan_select" ON public.checklist_daily;
DROP POLICY IF EXISTS "checklist_daily_karyawan_insert" ON public.checklist_daily;

CREATE POLICY "checklist_daily_owner_all" ON public.checklist_daily
  FOR ALL USING (private.is_owner()) WITH CHECK (private.is_owner());

CREATE POLICY "checklist_daily_karyawan_select" ON public.checklist_daily
  FOR SELECT USING (karyawan_id = auth.uid());

CREATE POLICY "checklist_daily_karyawan_insert" ON public.checklist_daily
  FOR INSERT WITH CHECK (karyawan_id = auth.uid());

-- ---- checklist_items ----
DROP POLICY IF EXISTS "checklist_items_owner_all"       ON public.checklist_items;
DROP POLICY IF EXISTS "checklist_items_karyawan_select" ON public.checklist_items;
DROP POLICY IF EXISTS "checklist_items_karyawan_update" ON public.checklist_items;

CREATE POLICY "checklist_items_owner_all" ON public.checklist_items
  FOR ALL USING (private.is_owner()) WITH CHECK (private.is_owner());

CREATE POLICY "checklist_items_karyawan_select" ON public.checklist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.checklist_daily cd
      WHERE cd.id = checklist_id AND cd.karyawan_id = auth.uid()
    )
  );

-- Karyawan hanya bisa update is_checked SEBELUM diverifikasi Owner
CREATE POLICY "checklist_items_karyawan_update" ON public.checklist_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.checklist_daily cd
      WHERE cd.id = checklist_id
        AND cd.karyawan_id = auth.uid()
        AND cd.status_verif = 'pending'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.checklist_daily cd
      WHERE cd.id = checklist_id
        AND cd.karyawan_id = auth.uid()
        AND cd.status_verif = 'pending'
    )
  );

-- ---- point_log ----
DROP POLICY IF EXISTS "point_log_owner_all"       ON public.point_log;
DROP POLICY IF EXISTS "point_log_karyawan_select" ON public.point_log;

CREATE POLICY "point_log_owner_all" ON public.point_log
  FOR ALL USING (private.is_owner()) WITH CHECK (private.is_owner());

CREATE POLICY "point_log_karyawan_select" ON public.point_log
  FOR SELECT USING (karyawan_id = auth.uid());

-- ---- resi_online ----
DROP POLICY IF EXISTS "resi_online_owner_all"       ON public.resi_online;
DROP POLICY IF EXISTS "resi_online_karyawan_select" ON public.resi_online;
DROP POLICY IF EXISTS "resi_online_karyawan_update" ON public.resi_online;

CREATE POLICY "resi_online_owner_all" ON public.resi_online
  FOR ALL USING (private.is_owner()) WITH CHECK (private.is_owner());

CREATE POLICY "resi_online_karyawan_select" ON public.resi_online
  FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY "resi_online_karyawan_update" ON public.resi_online
  FOR UPDATE USING (assigned_to = auth.uid()) WITH CHECK (assigned_to = auth.uid());

-- ---- pesanan_manual ----
DROP POLICY IF EXISTS "pesanan_manual_owner_all"       ON public.pesanan_manual;
DROP POLICY IF EXISTS "pesanan_manual_karyawan_select" ON public.pesanan_manual;
DROP POLICY IF EXISTS "pesanan_manual_karyawan_insert" ON public.pesanan_manual;
DROP POLICY IF EXISTS "pesanan_manual_karyawan_update" ON public.pesanan_manual;

CREATE POLICY "pesanan_manual_owner_all" ON public.pesanan_manual
  FOR ALL USING (private.is_owner()) WITH CHECK (private.is_owner());

-- Semua user login bisa lihat semua pesanan (transparansi operasional)
CREATE POLICY "pesanan_manual_karyawan_select" ON public.pesanan_manual
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "pesanan_manual_karyawan_insert" ON public.pesanan_manual
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "pesanan_manual_karyawan_update" ON public.pesanan_manual
  FOR UPDATE
  USING (created_by = auth.uid() OR assigned_to = auth.uid())
  WITH CHECK (created_by = auth.uid() OR assigned_to = auth.uid());

-- ---- gaji_bulanan ----
DROP POLICY IF EXISTS "gaji_bulanan_owner_all"       ON public.gaji_bulanan;
DROP POLICY IF EXISTS "gaji_bulanan_karyawan_select" ON public.gaji_bulanan;

CREATE POLICY "gaji_bulanan_owner_all" ON public.gaji_bulanan
  FOR ALL USING (private.is_owner()) WITH CHECK (private.is_owner());

-- Karyawan hanya bisa lihat gaji miliknya sendiri yang sudah dibayar
CREATE POLICY "gaji_bulanan_karyawan_select" ON public.gaji_bulanan
  FOR SELECT USING (karyawan_id = auth.uid() AND status_bayar = 'Sudah Bayar');

-- ============================================================
-- VIEW: Total poin karyawan (dengan security_invoker agar RLS tetap berlaku)
-- ============================================================
DROP VIEW IF EXISTS public.karyawan_points;
CREATE VIEW public.karyawan_points
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.nama,
  COALESCE(SUM(pl.delta), 0)::integer AS total_points
FROM public.profiles p
LEFT JOIN public.point_log pl ON pl.karyawan_id = p.id
WHERE p.role = 'karyawan'
GROUP BY p.id, p.nama;

COMMENT ON VIEW public.karyawan_points IS 'Total poin akumulatif tiap karyawan. RLS berlaku: karyawan hanya lihat diri sendiri, Owner lihat semua';
