# Project Brief: Aplikasi Manajemen Karyawan
## Toko Buku dan Kitab Terang

---

## 1. Ringkasan Proyek

Aplikasi web manajemen karyawan untuk Toko Buku dan Kitab Terang, diakses via HP masing-masing karyawan. Dibangun dengan Next.js + Supabase + Vercel, dengan rencana konversi ke Android (Capacitor) setelah sistem stabil.

---

## 2. Pengguna & Peran

| Role | Jumlah | Akses |
|---|---|---|
| **Owner** (Arya) | 1 | Full akses semua fitur |
| **Karyawan** | 3 | Akses terbatas sesuai tugas |

Autentikasi menggunakan Supabase Auth (email + password). Setiap akun punya role yang menentukan tampilan dan akses fitur.

---

## 3. Modul & Fitur

### 3.1 Modul SOP & Checklist Harian

**Owner:**
- Buat, edit, hapus SOP per karyawan
- SOP berisi daftar item checklist (teks bebas)
- Verifikasi checklist karyawan setiap malam
  - Per item: **Verif ✓** → +1 point | **Tolak ✗** → -1 point
- Lihat histori checklist semua karyawan

**Karyawan:**
- Lihat SOP yang ditugaskan ke dirinya
- Centang item checklist harian (bisa centang/hapus centang sebelum diverif)
- Lihat status verifikasi hari itu (belum diverif / diverif / ditolak)
- Tidak bisa melihat SOP karyawan lain

**Logika:**
- Checklist direset tiap hari (data histori tetap tersimpan)
- Verifikasi hanya bisa dilakukan Owner
- Setelah Owner verif, karyawan tidak bisa mengubah checklist hari itu

---

### 3.2 Modul Pesanan Online (Resi Shopee / TikTok)

**Owner:**
- Upload file PDF resi dari marketplace
- Assign resi ke salah satu karyawan
- Lihat status semua resi

**Karyawan:**
- Hanya melihat resi yang di-assign ke dirinya
- Download PDF resi
- Update status resi:
  - `Baru` → `Packing` → `Siap Kirim` → `Terkirim`
- Tidak bisa melihat resi milik karyawan lain

**Storage:**
- PDF resi disimpan di Supabase Storage
- Akses file dibatasi per karyawan (Row Level Security)

---

### 3.3 Modul Pesanan Manual

Untuk pesanan yang masuk lewat WA/telepon/langsung: satuan buku, yasin custom, maupun grosir.

**Owner & Karyawan (keduanya bisa input):**
- Buat pesanan baru dengan data:
  - Nama pemesan
  - Kontak (nomor HP)
  - Detail pesanan (teks bebas: nama buku, jumlah, spesifikasi)
  - Jenis pesanan: `Satuan` / `Custom` / `Grosir`
  - Catatan tambahan
- Update status pesanan

**Status Tracking:**
```
Diterima → Diproses → Siap → Selesai
```

**Owner tambahan:**
- Lihat semua pesanan dari semua karyawan
- Edit/hapus pesanan
- Filter pesanan by status, jenis, karyawan

**Karyawan:**
- Lihat semua pesanan (transparansi operasional)
- Edit status pesanan yang mereka buat atau yang ditugaskan ke mereka

---

### 3.4 Modul Point & Penggajian

**Point System:**
- Point bersifat **akumulatif** (tidak direset per bulan)
- +1 point: item SOP diverifikasi Owner
- -1 point: item SOP ditolak Owner
- Owner bisa melihat total point dan histori pergerakan point tiap karyawan

**Penggajian:**
- Gaji pokok bulanan flat per karyawan (diatur Owner)
- Bonus bersifat manual dan fleksibel — Owner menentukan nominal bonus sendiri berdasarkan point karyawan
- Owner bisa:
  - Input/edit gaji pokok tiap karyawan
  - Tambahkan bonus (nominal bebas, bisa kasih catatan alasan)
  - Lihat rekap gaji + bonus per bulan per karyawan
  - Tandai status pembayaran gaji bulan tertentu: `Belum Bayar` / `Sudah Bayar`
- Karyawan bisa:
  - Lihat total point sendiri
  - Lihat riwayat gaji & bonus yang sudah dibayar

---

## 4. Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14+ (App Router) |
| UI | Tailwind CSS + shadcn/ui |
| Backend/DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| File Storage | Supabase Storage |
| Deployment | Vercel |
| Future Android | Capacitor (wrapper Next.js → APK) |

---

## 5. Struktur Database (Supabase)

```sql
-- Tabel utama

users              -- dari Supabase Auth, extended dengan profiles
profiles           -- id, nama, role (owner/karyawan), gaji_pokok

sop_templates      -- id, karyawan_id, nama_sop, created_at
sop_items          -- id, template_id, urutan, teks_item

checklist_daily    -- id, karyawan_id, tanggal, status_verif (pending/done)
checklist_items    -- id, checklist_id, sop_item_id, is_checked, is_verified, point_delta

point_log          -- id, karyawan_id, delta, alasan, tanggal, ref_checklist_id

resi_online        -- id, filename, storage_path, assigned_to, status, uploaded_by, created_at

pesanan_manual     -- id, nama_pemesan, kontak, detail, jenis, catatan, status, created_by, created_at

gaji_bulanan       -- id, karyawan_id, bulan, tahun, gaji_pokok, bonus, catatan_bonus, status_bayar
```

---

## 6. Halaman Aplikasi

### Owner
- `/dashboard` — Ringkasan harian (checklist pending, resi baru, pesanan aktif)
- `/sop` — Kelola SOP tiap karyawan
- `/checklist` — Verifikasi checklist harian semua karyawan
- `/resi` — Upload & assign resi PDF
- `/pesanan` — Semua pesanan manual
- `/karyawan` — Data karyawan, point, gaji
- `/gaji` — Rekap & input gaji bulanan

### Karyawan
- `/dashboard` — Checklist hari ini + point saya
- `/checklist` — Centang SOP harian
- `/resi` — Resi yang di-assign ke saya
- `/pesanan` — Lihat & input pesanan manual
- `/profil` — Point & histori gaji saya

---

## 7. Alur Kerja Pengembangan (Workflow untuk Claude Code)

Struktur ini dirancang agar AI tetap fokus pada konteks dan meminimalisir kesalahan logika saat mengeksekusi project brief. **Setiap tahap harus selesai sebelum lanjut ke tahap berikutnya.**

### Tahap 1 — Fondasi: Database & Schema ✅ SELESAI (2026-05-05)


> **Next.js project:** `terang-app/` — App Router, TypeScript, Tailwind, Supabase SSR
> **Supabase project:** `bzwjiyihbyfmiayqctok` (employee-management, toko-terang)
> **Migration file:** `terang-app/supabase/migrations/20260505000000_initial_schema.sql`

Database adalah otak dari aplikasi; jika strukturnya salah, maka seluruh fitur di atasnya akan bermasalah.

- ✅ **Definisi Enum & Tipe Data:** Tentukan semua status secara konsisten:
  - Resi: `Baru` `Packing` `Siap Kirim` `Terkirim`
  - Pesanan Manual: `Diterima` `Diproses` `Siap` `Selesai`
  - Gaji: `Belum Bayar` `Sudah Bayar`
  - Verifikasi Checklist: `pending` `verified` `rejected`
- ✅ **Pembuatan Tabel & Relasi:** Semua 9 tabel dibuat (profiles, sop_templates, sop_items, checklist_daily, checklist_items, point_log, resi_online, pesanan_manual, gaji_bulanan) + indexes
- ✅ **Row Level Security (RLS):** Policies aktif di semua tabel:
  - Karyawan hanya akses data miliknya
  - Point hanya visible ke diri sendiri dan Owner
  - Owner akses segalanya (via `private.is_owner()`)
- ✅ **Trigger Functions:** auto-create profile, auto-populate checklist items, track terkirim_at, auto-log poin, update updated_at
- ✅ **View:** `karyawan_points` dengan `security_invoker=true`
- ✅ **Ekspor Skema:** Skema tersimpan di migration file di atas

### Tahap 2 — Mesin: Backend & Server Actions ✅ SELESAI (2026-05-05)

> **Zod:** v4.4.3 — gunakan `.issues[0].message` (bukan `.errors`)
> **Actions dir:** `terang-app/actions/` — 7 file, 39 fungsi
> **Types & Validasi:** `terang-app/lib/types.ts` + `terang-app/lib/validations.ts`
> **pg_cron migration:** `terang-app/supabase/migrations/20260505000001_pg_cron_auto_delete_resi.sql`

- ✅ **Server Actions:** `/actions/auth.ts`, `karyawan.ts`, `sop.ts`, `checklist.ts`, `resi.ts`, `gaji.ts` — semua operasi CRUD, query, dan bisnis logic
- ✅ **Validasi Data (Zod v4):** Semua input divalidasi via `lib/validations.ts` sebelum masuk DB
- ✅ **Logika Point:** `verifyChecklistItem` → trigger DB `log_verification_points` → auto-insert ke `point_log` (+1/-1)
- ✅ **Logika Status:** `updateResiStatus` → trigger DB `set_resi_terkirim_at` → auto-set `terkirim_at`
- ✅ **Auto-delete Resi:** `auto_delete_resi_terkirim()` + `cron.schedule('auto-delete-resi-terkirim', '0 19 * * *', ...)` — jalankan tiap hari 02:00 WIB. **pg_cron sudah aktif di Supabase (enabled via Extensions).** Migration SQL sudah siap dijalankan di SQL Editor.

### Tahap 3 — Tampilan: UI & Frontend ✅ SELESAI (2026-05-05)

> **Design system:** Warm neutral (`#FAF8F5`), sage accent (`#586D57`), font Plus Jakarta Sans + JetBrains Mono
> **Route group:** `terang-app/app/(app)/` — semua halaman protected ada di sini
> **Proxy (auth guard):** `terang-app/proxy.ts` — menggantikan `middleware.ts` (Next.js 16 breaking change)

- ✅ **Auth:** `/login` — form login, error handling, redirect ke dashboard
- ✅ **Layout:** `(app)/layout.tsx` — auth check + bottom nav dinamis (karyawan/owner berbeda)
- ✅ **Dashboard:** `/dashboard` — karyawan: checklist progress + poin; owner: KPI + verifikasi pending + poin semua karyawan
- ✅ **Checklist:** `/checklist` — karyawan: centang item SOP real-time (optimistic update); owner: verifikasi per item (+1/-1 poin) + finalize
- ✅ **Resi Online:** `/resi` — karyawan: lihat & update status resi; owner: upload PDF ke Supabase Storage + assign + rekap
- ✅ **Pesanan Manual:** `/pesanan` — buat pesanan + update status (semua user); semua pesanan visible (transparansi)
- ✅ **Profil Karyawan:** `/profil` — total poin akumulatif, histori poin, riwayat gaji
- ✅ **Karyawan (owner):** `/karyawan` — daftar karyawan + poin + link ke SOP management
- ✅ **Gaji (owner):** `/gaji` — input/update gaji bulanan + bonus + tandai bayar
- ✅ **SOP (owner):** `/sop` — kelola SOP per karyawan (CRUD template + item), selector karyawan

**Catatan teknis:**
- Tailwind v4: custom tokens via `@theme` di `globals.css` (tidak pakai `tailwind.config.js`)
- Upload PDF: client-side ke Supabase Storage, lalu server action simpan metadata
- `proxy.ts` menggantikan `middleware.ts` — fungsi harus bernama `proxy` (bukan `middleware`)
- Build: `✓ Compiled successfully` — 0 error, 11 routes

### Tahap 4 — Finalisasi: Storage & Deployment ✅ SELESAI (2026-05-06)

> **Env vars:** `terang-app/.env.local` — 3 keys: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY
> **Admin client:** `terang-app/utils/supabase/admin.ts` — pakai service role key, hanya dipakai di Server Actions

- ✅ **Konfigurasi Storage:** Bucket `resi-pdf` dibuat + 5 RLS policy (owner full access, karyawan hanya download resi assigned ke mereka) — migration `20260506000000_storage_bucket_resi_pdf.sql` selesai dijalankan
- ✅ **pg_cron migration:** `20260505000001_pg_cron_auto_delete_resi.sql` selesai dijalankan — function auto-delete juga bersihkan `storage.objects`
- ✅ **Setup user pertama:** Akun owner dibuat di Supabase Auth + `profiles.role = 'owner'` diupdate via SQL
- **Deployment ke Vercel:** Belum dilakukan — next step
- **Test end-to-end:** Belum dilakukan — setelah deploy

### Perbaikan & Fitur Tambahan (2026-05-06)

**Refactoring kode:**
- ✅ `revalidatePath` ditambahkan ke semua 14 mutating server actions (checklist, resi, pesanan, sop, gaji, karyawan) — halaman Server Component kini auto-refresh setelah mutasi tanpa perlu manual reload
- ✅ Dynamic import `getTodayChecklistsAll` di dashboard diperbaiki menjadi static import
- ✅ `createKaryawan` diubah pakai `createAdminClient()` (service role key) dengan owner verification — sebelumnya dead code karena salah pakai publishable key

**Fitur baru — Tambah Karyawan via UI:**
- ✅ `utils/supabase/admin.ts` — admin client (service role key, server-only)
- ✅ `actions/karyawan.ts` — `createKaryawan` kini functional: verify caller is owner → admin.auth.admin.createUser → update gaji_pokok → revalidatePath
- ✅ `app/(app)/karyawan/tambah-karyawan-form.tsx` — form collapsible (nama, email, password, gaji pokok)
- ✅ `/karyawan` page: info box "buka Supabase Dashboard" diganti dengan form langsung di app

**Design fix — Dropdown `<select>`:**
- ✅ Semua 3 dropdown (`upload-resi-form`, `buat-pesanan-form`, `input-gaji-form`) difix: `appearance-none` + wrapper relatif + custom chevron SVG — konsisten dengan design system

**Performance — Loading states:**
- ✅ 8 file `loading.tsx` dibuat untuk semua halaman protected: dashboard, checklist, resi, pesanan, karyawan, gaji, sop, profil
- Skeleton masing-masing dirancang mirip struktur halaman aslinya (menghindari layout shift)
- Next.js menampilkan skeleton **instan** saat navigasi, data fetch berjalan di background

---

### Tips Penting saat Sesi Claude Code

> **Modularitas:** Minta Claude Code mengerjakan **satu modul hingga selesai** sebelum pindah ke modul berikutnya. Urutan yang disarankan: Auth → SOP & Checklist → Resi Online → Pesanan Manual → Gaji & Point.

> **Ingatkan skema:** Setiap memulai sesi chat baru di Claude Code, selalu paste ulang skema database (Section 5) agar konteks tidak putus.

> **Satu fitur, satu sesi:** Jangan minta terlalu banyak sekaligus. Contoh prompt yang baik: *"Sekarang buat halaman checklist harian untuk karyawan. Skema tabel sudah ada. Gunakan Server Actions di /actions/checklist.ts."*

---

## 8. Prioritas Pengembangan (Phase)

### Phase 1 — MVP Core
- [x] Setup Next.js + Supabase (project scaffolded, schema deployed) — *2026-05-05*
- [x] Auth UI (halaman login) — *2026-05-05*
- [x] Modul SOP & Checklist + Point System — *2026-05-05*
- [x] Modul Resi Online (upload PDF + assign + status) — *2026-05-05*

### Phase 2 — Operasional Lengkap
- [x] Modul Pesanan Manual (CRUD + status tracking) — *2026-05-05*
- [x] Modul Gaji & Bonus — *2026-05-05*

### Phase 3 — Polish & Android
- [ ] Setup Storage + Deployment ke Vercel (Tahap 4)
- [ ] PWA manifest
- [ ] Wrap ke Android dengan Capacitor

---

## 9. Catatan Penting

- Semua akses data di Supabase menggunakan **Row Level Security (RLS)** — karyawan hanya bisa akses data miliknya
- Tidak ada sistem notifikasi push — karyawan cek mandiri saat buka app
- Desain mobile-first karena diakses dari HP
- Tidak ada fitur chat/komentar di MVP — komunikasi tetap via WA
- Point tidak bisa dimanipulasi karyawan — hanya Owner yang bisa trigger perubahan point (via verifikasi)
- **Point bisa bernilai negatif** — tidak ada batas bawah (floor)
- **Visibilitas point:** Karyawan hanya bisa melihat point miliknya sendiri. Karyawan lain tidak bisa melihat. Hanya Owner yang bisa melihat point semua karyawan
- **Arsip resi:** Resi yang statusnya `Terkirim` otomatis diarsipkan. Setelah 4 hari sejak status `Terkirim`, file PDF di Supabase Storage dan record resi dihapus permanen secara otomatis (via Supabase cron job / pg_cron)
