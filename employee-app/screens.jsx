// screens.jsx — Terang Manajemen Karyawan — matched to guesthouse-pms aesthetic
// Warm neutral base, sage accent, Plus Jakarta Sans + JetBrains Mono, 14px, no shadows.

const T = {
  // Warm neutrals
  bg: '#FAF8F5',
  bg2: '#F4F1EA',
  bg3: '#EFEBE2',
  surface: '#FFFFFF',
  hover: '#F0EDE5',

  // Sage
  sage: '#586D57',
  sageDark: '#3F4F3F',
  sageDeep: '#2B362B',
  sageSoft: '#E8EBE5',
  sageMid: '#D5DCD2',

  // Borders — background contrast, not shadows
  border: '#E8E3D8',
  borderHi: '#DDD7C8',
  borderSage: '#CDD4C9',

  // Text
  text: '#2B362B',
  textSec: '#5C5A52',
  textDim: '#8B887D',
  textMute: '#B5B1A4',

  // Status
  amber: '#A8722C',
  amberSoft: '#F2E8D7',
  red: '#9C4A3A',
  redSoft: '#EFD9D2',
  blue: '#4A6B8C',
  blueSoft: '#D9E2EC',

  // Type
  font: '"Plus Jakarta Sans", -apple-system, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, "SF Mono", monospace',
};

// ─────────────────────────────────────────────────────────────
// Plate — flat panel with border, no shadow
// ─────────────────────────────────────────────────────────────
function Plate({ children, style = {}, radius = 10, surface = false }) {
  return (
    <div style={{
      borderRadius: radius,
      background: surface ? T.surface : 'transparent',
      border: `1px solid ${T.border}`,
      ...style,
    }}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// Status bar (light, no glass)
// ─────────────────────────────────────────────────────────────
function StatusBar({ time = '8:42' }) {
  const c = T.text;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 28px 6px', position: 'relative', zIndex: 20,
      fontFamily: T.font,
    }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: c, letterSpacing: 0.1 }}>{time}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="16" height="10" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="0.6" fill={c}/><rect x="4.5" y="5" width="3" height="6" rx="0.6" fill={c}/><rect x="9" y="2.5" width="3" height="8.5" rx="0.6" fill={c}/><rect x="13.5" y="0" width="3" height="11" rx="0.6" fill={c}/></svg>
        <svg width="14" height="10" viewBox="0 0 17 12"><path d="M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z" fill={c}/><path d="M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z" fill={c}/><circle cx="8.5" cy="10.5" r="1.5" fill={c}/></svg>
        <svg width="24" height="11" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke={c} strokeOpacity="0.4" fill="none"/><rect x="2" y="2" width="16" height="9" rx="2" fill={c}/></svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Icons — monoline 1.5px
// ─────────────────────────────────────────────────────────────
const ic = (s, c, path) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
);
const Icon = {
  bell: (s = 18, c = T.text) => ic(s, c, <><path d="M6 8a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 004 0"/></>),
  search: (s = 18, c = T.text) => ic(s, c, <><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/></>),
  check: (s = 13, c = '#fff') => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l5 5L20 7"/></svg>,
  x: (s = 12, c = T.red) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>,
  chevR: (s = 12, c = T.textDim) => ic(s, c, <path d="M9 5l7 7-7 7"/>),
  chevL: (s = 14, c = T.text) => ic(s, c, <path d="M15 6l-6 6 6 6"/>),
  clipboard: (s = 18, c = T.text) => ic(s, c, <><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M9 12h6M9 16h4"/></>),
  truck: (s = 18, c = T.text) => ic(s, c, <><path d="M2 7h11v10H2zM13 10h5l3 3v4h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></>),
  bag: (s = 18, c = T.text) => ic(s, c, <><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 016 0v2"/></>),
  home: (s = 18, c = T.text) => ic(s, c, <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z"/>),
  user: (s = 18, c = T.text) => ic(s, c, <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></>),
  users: (s = 18, c = T.text) => ic(s, c, <><circle cx="9" cy="9" r="3.5"/><circle cx="17" cy="10" r="2.5"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5"/><path d="M15 19c0-2.5 1-3.5 3-3.5s3 1 3 3"/></>),
  wallet: (s = 18, c = T.text) => ic(s, c, <><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/></>),
  shield: (s = 18, c = T.text) => ic(s, c, <><path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z"/><path d="M9 12l2 2 4-4"/></>),
  arrow: (s = 13, c = '#fff') => ic(s, c, <><path d="M5 12h14M13 6l6 6-6 6"/></>),
  plus: (s = 14, c = '#fff') => ic(s, c, <path d="M12 5v14M5 12h14"/>),
  setting: (s = 16, c = T.text) => ic(s, c, <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 00-.1-1.4l2-1.5-2-3.4-2.3.9a7 7 0 00-2.4-1.4L13.7 3h-3.4l-.5 2.2a7 7 0 00-2.4 1.4l-2.3-.9-2 3.4 2 1.5A7 7 0 005 12c0 .5 0 .9.1 1.4l-2 1.5 2 3.4 2.3-.9a7 7 0 002.4 1.4l.5 2.2h3.4l.5-2.2a7 7 0 002.4-1.4l2.3.9 2-3.4-2-1.5c.1-.5.1-.9.1-1.4z"/></>),
  logout: (s = 16, c = T.textSec) => ic(s, c, <><path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3"/><path d="M9 8l-4 4 4 4M5 12h11"/></>),
  dot3: (s = 16, c = T.text) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>,
  trend: (s = 12, c = T.sage) => ic(s, c, <><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></>),
  flame: (s = 12, c = T.amber) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M12 2c0 4-4 5-4 9a4 4 0 008 0c0-1.5-1-2.5-1-4 2 1 3 3 3 5a6 6 0 11-12 0c0-5 6-6 6-10z"/></svg>,
  star: (s = 12, c = T.sage) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M12 3l2.6 5.8 6.4.6-4.8 4.4 1.4 6.4L12 17l-5.6 3.2L7.8 13.8 3 9.4l6.4-.6L12 3z"/></svg>,
  book: (s = 18, c = T.text) => ic(s, c, <><path d="M4 4h7a3 3 0 013 3v13a2 2 0 00-2-2H4z"/><path d="M20 4h-7a3 3 0 00-3 3v13a2 2 0 012-2h8z"/></>),
};

// ─────────────────────────────────────────────────────────────
// Home indicator
// ─────────────────────────────────────────────────────────────
function HomeIndicator() {
  return (
    <div style={{ height: 30, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 8 }}>
      <div style={{ width: 130, height: 4, borderRadius: 99, background: 'rgba(43,54,43,0.35)' }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bottom navbar — flat, bordered, no glass
// ─────────────────────────────────────────────────────────────
function BottomNav({ active = 'home' }) {
  const items = [
    { id: 'home', icon: Icon.home, label: 'Beranda' },
    { id: 'checklist', icon: Icon.clipboard, label: 'Checklist' },
    { id: 'orders', icon: Icon.bag, label: 'Pesanan' },
    { id: 'resi', icon: Icon.truck, label: 'Resi' },
    { id: 'profile', icon: Icon.user, label: 'Profil' },
  ];
  return (
    <div style={{ padding: '0 16px 10px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '8px 4px',
        background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`,
      }}>
        {items.map(it => {
          const isActive = it.id === active;
          return (
            <div key={it.id} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '6px 10px', borderRadius: 10,
              background: isActive ? T.sageSoft : 'transparent',
              minWidth: 56,
            }}>
              {it.icon(18, isActive ? T.sage : T.textDim)}
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.1,
                color: isActive ? T.sage : T.textDim }}>{it.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Phone surface
// ─────────────────────────────────────────────────────────────
function ScreenBg({ children }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: T.bg,
      fontFamily: T.font, color: T.text, fontSize: 14,
      display: 'flex', flexDirection: 'column',
    }}>{children}</div>
  );
}

// ═════════════════════════════════════════════════════════════
// SCREEN 1 — Dashboard
// ═════════════════════════════════════════════════════════════
function DashboardScreen() {
  return (
    <ScreenBg>
      <StatusBar />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: T.sage,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 600, fontSize: 13, fontFamily: T.mono, letterSpacing: 0.5 }}>FA</div>
          <div>
            <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500, fontFamily: T.mono, letterSpacing: 0.3 }}>SENIN, 4 MEI</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginTop: 1 }}>Fajar Alamsyah</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={btnIcon}>{Icon.search(16)}</button>
          <button style={{ ...btnIcon, position: 'relative' }}>
            {Icon.bell(16)}
            <div style={{ position: 'absolute', top: 7, right: 7, width: 6, height: 6, borderRadius: '50%', background: T.amber }} />
          </button>
        </div>
      </div>

      {/* Greeting */}
      <div style={{ padding: '24px 20px 16px' }}>
        <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500, fontFamily: T.mono, letterSpacing: 0.4, textTransform: 'uppercase' }}>Beranda</div>
        <div style={{ fontSize: 24, fontWeight: 600, marginTop: 4, letterSpacing: -0.4, color: T.text, lineHeight: 1.2 }}>Assalamualaikum, Fajar</div>
        <div style={{ fontSize: 13, color: T.textSec, marginTop: 6, fontWeight: 400 }}>Toko Terang · Cabang Solo</div>
      </div>

      {/* Stat grid (Linear-style: number-first, label small) */}
      <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <StatTile label="Checklist Hari Ini" value="7/10" sub="3 tugas tersisa" prog={0.7} />
        <StatTile label="Poin Bulan Ini" value="184" sub="+12 dari minggu lalu" trend />
        <StatTile label="Streak" value="14" suffix="hari" sub="tanpa absen" flame />
        <StatTile label="Resi Pending" value="3" sub="paket menunggu input" />
      </div>

      {/* Section: Tugas Hari Ini preview */}
      <div style={{ padding: '24px 20px 0' }}>
        <SectionHeader label="Tugas Hari Ini" action="Lihat semua" />
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
          {[
            { t: 'Cek toilet & tempat wudhu', sub: '07:30 · sebelum operasi', state: 'unchecked' },
            { t: 'Tutup kasir & rekap harian', sub: 'Sebelum 21:00', state: 'unchecked' },
            { t: 'Matikan AC & kunci toko', sub: 'Foto bukti penguncian', state: 'unchecked' },
          ].map((r, i, arr) => (
            <DashTask key={i} {...r} last={i === arr.length - 1} />
          ))}
        </div>
      </div>

      {/* Section: Aksi cepat */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionHeader label="Aksi Cepat" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <ActionTile icon={Icon.truck(18, T.sage)} title="Resi Saya" sub="3 menunggu" />
          <ActionTile icon={Icon.bag(18, T.sage)} title="Pesanan" sub="2 stok rendah" />
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 14 }} />
      <BottomNav active="home" />
      <HomeIndicator />
    </ScreenBg>
  );
}

const btnIcon = {
  width: 34, height: 34, borderRadius: 8,
  background: T.surface, border: `1px solid ${T.border}`, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
};

function StatTile({ label, value, suffix, sub, prog, trend, flame }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 10, color: T.textDim, fontWeight: 500, fontFamily: T.mono, letterSpacing: 0.4, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
        <div style={{ fontSize: 24, fontWeight: 600, color: T.text, letterSpacing: -0.6, fontFamily: T.mono, lineHeight: 1 }}>{value}</div>
        {suffix && <span style={{ fontSize: 12, color: T.textDim, fontWeight: 500 }}>{suffix}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
        {trend && Icon.trend(11, T.sage)}
        {flame && Icon.flame(11, T.amber)}
        <div style={{ fontSize: 11, color: T.textSec, fontWeight: 500 }}>{sub}</div>
      </div>
      {prog !== undefined && (
        <div style={{ height: 3, borderRadius: 99, background: T.bg3, marginTop: 10, overflow: 'hidden' }}>
          <div style={{ width: `${prog * 100}%`, height: '100%', background: T.sage }} />
        </div>
      )}
    </div>
  );
}

function SectionHeader({ label, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <div style={{ fontSize: 10.5, color: T.textDim, fontWeight: 600, fontFamily: T.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
      {action && <div style={{ fontSize: 12, color: T.sage, fontWeight: 500 }}>{action}</div>}
    </div>
  );
}

function DashTask({ t, sub, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      borderBottom: last ? 'none' : `1px solid ${T.border}` }}>
      <div style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${T.borderHi}`, background: T.bg }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{t}</div>
        <div style={{ fontSize: 11.5, color: T.textDim, marginTop: 1 }}>{sub}</div>
      </div>
      <div style={{ fontSize: 11, color: T.sage, fontWeight: 600, fontFamily: T.mono,
        padding: '3px 7px', borderRadius: 4, background: T.sageSoft }}>+1</div>
    </div>
  );
}

function ActionTile({ icon, title, sub }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14 }}>
      <div style={{ width: 32, height: 32, borderRadius: 7, background: T.sageSoft,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text, marginTop: 10 }}>{title}</div>
      <div style={{ fontSize: 11.5, color: T.textDim, marginTop: 1 }}>{sub}</div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SCREEN 2 — Checklist Harian
// ═════════════════════════════════════════════════════════════
const CHECKLIST = [
  { t: 'Buka toko & nyalakan AC', sub: '07:30 · sebelum operasi', state: 'verified', pts: 1 },
  { t: 'Sapu & pel area depan', sub: 'Pintu masuk hingga rak utama', state: 'verified', pts: 1 },
  { t: 'Cek stok rak Hadis', sub: 'Tandai jika kurang dari 3 buku', state: 'verified', pts: 1 },
  { t: 'Doa pagi bersama tim', sub: 'Berjamaah · 5 menit', state: 'verified', pts: 1 },
  { t: 'Bersihkan etalase kaca', sub: 'Gunakan lap mikrofiber', state: 'rejected', pts: -1 },
  { t: 'Input stok masuk pagi', sub: '12 paket · gudang belakang', state: 'checked', pts: 1 },
  { t: 'Update display buku baru', sub: 'Rak promosi & meja kasir', state: 'checked', pts: 1 },
  { t: 'Cek toilet & tempat wudhu', sub: 'Pastikan bersih & wangi', state: 'unchecked', pts: 1 },
  { t: 'Tutup kasir & rekap harian', sub: 'Sebelum 21:00', state: 'unchecked', pts: 1 },
  { t: 'Matikan AC & kunci toko', sub: 'Foto bukti penguncian', state: 'unchecked', pts: 1 },
];

function ChecklistScreen() {
  const done = CHECKLIST.filter(i => i.state === 'verified' || i.state === 'checked').length;
  const verified = CHECKLIST.filter(i => i.state === 'verified').length;
  const checked = CHECKLIST.filter(i => i.state === 'checked').length;
  const reject = CHECKLIST.filter(i => i.state === 'rejected').length;
  const pct = done / CHECKLIST.length;

  return (
    <ScreenBg>
      <StatusBar />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 0' }}>
        <button style={btnIcon}>{Icon.chevL(15)}</button>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Senin, 4 Mei 2026</div>
        <button style={btnIcon}>{Icon.dot3(15)}</button>
      </div>

      {/* Title */}
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ fontSize: 10.5, color: T.textDim, fontWeight: 600, fontFamily: T.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>SOP Harian</div>
        <div style={{ fontSize: 24, fontWeight: 600, marginTop: 4, letterSpacing: -0.4, color: T.text }}>Checklist Harian</div>
      </div>

      {/* Summary */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10.5, color: T.textDim, fontWeight: 600, fontFamily: T.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Progres</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                <div style={{ fontSize: 28, fontWeight: 600, color: T.text, letterSpacing: -0.7, fontFamily: T.mono, lineHeight: 1 }}>{done}/{CHECKLIST.length}</div>
                <div style={{ fontSize: 12, color: T.textDim, fontWeight: 500 }}>{Math.round(pct * 100)}%</div>
              </div>
            </div>
          </div>
          {/* Segmented bar */}
          <div style={{ display: 'flex', gap: 2, height: 6, marginBottom: 10 }}>
            {CHECKLIST.map((it, i) => {
              const c = it.state === 'verified' ? T.sage
                       : it.state === 'checked' ? T.sageMid
                       : it.state === 'rejected' ? T.red
                       : T.bg3;
              return <div key={i} style={{ flex: 1, background: c, borderRadius: 1.5 }} />;
            })}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: T.textSec, fontWeight: 500 }}>
            <Legend dot={T.sage} label={`${verified} terverifikasi`} />
            <Legend dot={T.sageMid} label={`${checked} menunggu`} />
            <Legend dot={T.red} label={`${reject} ditolak`} />
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 14px' }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
          {CHECKLIST.map((item, i) => <ChecklistRow key={i} {...item} last={i === CHECKLIST.length - 1} />)}
        </div>
      </div>

      <BottomNav active="checklist" />
      <HomeIndicator />
    </ScreenBg>
  );
}

function Legend({ dot, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 7, height: 7, borderRadius: 2, background: dot }} />
      <span>{label}</span>
    </div>
  );
}

function ChecklistRow({ t, sub, state, pts, last }) {
  const isVerified = state === 'verified';
  const isRejected = state === 'rejected';
  const isChecked = state === 'checked';
  const isDone = isVerified || isChecked;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
      borderBottom: last ? 'none' : `1px solid ${T.border}`,
      background: isRejected ? T.redSoft + '50' : 'transparent' }}>
      {/* Checkbox */}
      <div style={{
        width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 2,
        background: isDone && !isRejected ? T.sage : isRejected ? '#fff' : T.bg,
        border: `1.5px solid ${isDone && !isRejected ? T.sage : isRejected ? T.red : T.borderHi}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isDone && !isRejected && Icon.check(11, '#fff')}
        {isRejected && Icon.x(10, T.red)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: isDone && !isRejected ? T.textSec : T.text,
          textDecoration: isVerified ? 'line-through' : 'none', textDecorationColor: T.textMute }}>{t}</div>
        <div style={{ fontSize: 11.5, color: T.textDim, marginTop: 2, fontWeight: 400 }}>{sub}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
          {isVerified && <Tag color={T.sage} bg={T.sageSoft} label="Terverifikasi" />}
          {isRejected && <Tag color={T.red} bg={T.redSoft} label="Ditolak owner" />}
          {isChecked && <Tag color={T.blue} bg={T.blueSoft} label="Menunggu verifikasi" />}
          {state === 'unchecked' && <Tag color={T.textDim} bg={T.bg3} label="Belum dikerjakan" />}
        </div>
      </div>

      <div style={{
        padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600, fontFamily: T.mono,
        background: isRejected ? T.redSoft : T.sageSoft,
        color: isRejected ? T.red : T.sage,
        flexShrink: 0, marginTop: 2,
      }}>{pts > 0 ? `+${pts}` : pts}</div>
    </div>
  );
}

function Tag({ color, bg, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 7px', borderRadius: 4,
      background: bg, fontSize: 10.5, fontWeight: 500, color, fontFamily: T.mono, letterSpacing: 0.1 }}>
      {label}
    </span>
  );
}

// ═════════════════════════════════════════════════════════════
// SCREEN 3 — Profile
// ═════════════════════════════════════════════════════════════
function ProfileScreen({ owner = false }) {
  return (
    <ScreenBg>
      <StatusBar />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 0' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>Profil</div>
        <button style={btnIcon}>{Icon.setting(15)}</button>
      </div>

      {/* Profile card */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 10, background: T.sage,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 600, fontSize: 18, fontFamily: T.mono, letterSpacing: 0.5 }}>FA</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>Fajar Alamsyah</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span style={{ fontSize: 10.5, padding: '2px 7px', borderRadius: 4,
                  background: owner ? T.sageSoft : T.blueSoft,
                  color: owner ? T.sage : T.blue, fontWeight: 600, fontFamily: T.mono, letterSpacing: 0.4 }}>
                  {owner ? 'OWNER' : 'KARYAWAN'}
                </span>
                <span style={{ fontSize: 11.5, color: T.textDim, fontWeight: 500 }}>· Cabang Solo</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 0, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
            <Stat label="Poin" value="184" />
            <div style={{ width: 1, background: T.border }} />
            <Stat label="Streak" value="14" suffix="hari" />
            <div style={{ width: 1, background: T.border }} />
            <Stat label="Resi /Bln" value="62" />
          </div>
        </div>
      </div>

      {/* Menu */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionHeader label="Akun & Pekerjaan" />
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <MenuItem icon={Icon.user(16)} label="Edit Profil" />
          <MenuItem icon={Icon.truck(16)} label="Resi Online" badge="12" />
          <MenuItem icon={Icon.book(16)} label="Histori Tugas" />
          <MenuItem icon={Icon.star(13, T.sage)} label="Riwayat Poin & Reward" last />
        </div>
      </div>

      {owner && (
        <div style={{ padding: '14px 20px 0' }}>
          <SectionHeader label="Khusus Owner" />
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
            <MenuItem icon={Icon.users(16)} label="Karyawan" sub="6 aktif" />
            <MenuItem icon={Icon.wallet(16)} label="Gaji" sub="Periode Mei 2026" />
            <MenuItem icon={Icon.shield(16)} label="Verifikasi" badge="7" badgeSage last />
          </div>
        </div>
      )}

      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <MenuItem icon={Icon.logout(16, T.red)} label="Keluar" labelColor={T.red} chevron={false} last />
        </div>
        <div style={{ fontSize: 10.5, color: T.textMute, padding: '14px 4px 0', fontWeight: 500, fontFamily: T.mono, letterSpacing: 0.3, textAlign: 'center' }}>
          terang v2.4 · made with ﷽
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 14 }} />
      <BottomNav active="profile" />
      <HomeIndicator />
    </ScreenBg>
  );
}

function Stat({ label, value, suffix }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, justifyContent: 'center' }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: T.text, letterSpacing: -0.4, fontFamily: T.mono, lineHeight: 1 }}>{value}</span>
        {suffix && <span style={{ fontSize: 11, color: T.textDim, fontWeight: 500 }}>{suffix}</span>}
      </div>
      <div style={{ fontSize: 10, color: T.textDim, fontWeight: 500, fontFamily: T.mono, letterSpacing: 0.4, marginTop: 4, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

function MenuItem({ icon, label, labelColor, sub, badge, badgeSage, chevron = true, last = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      borderBottom: last ? 'none' : `1px solid ${T.border}` }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: T.bg2,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: labelColor || T.text }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: T.textDim, marginTop: 1, fontWeight: 400 }}>{sub}</div>}
      </div>
      {badge && (
        <span style={{
          minWidth: 20, height: 20, padding: '0 6px', borderRadius: 4, fontSize: 10.5, fontWeight: 600, fontFamily: T.mono,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: badgeSage ? T.sage : T.bg3,
          color: badgeSage ? '#fff' : T.text,
        }}>{badge}</span>
      )}
      {chevron && Icon.chevR(11, T.textMute)}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// DESKTOP — Linear-inspired, sidebar + content
// ═════════════════════════════════════════════════════════════
function DesktopApp() {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex',
      background: T.bg, fontFamily: T.font, color: T.text, fontSize: 14,
    }}>
      {/* SIDEBAR */}
      <div style={{ width: 224, padding: '14px 12px 14px 14px', display: 'flex', flexDirection: 'column',
        borderRight: `1px solid ${T.border}` }}>
        {/* Workspace */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 16px' }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: T.sage,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 12, fontFamily: T.mono, letterSpacing: 0.5 }}>T</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, letterSpacing: -0.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Toko Terang</div>
            <div style={{ fontSize: 10.5, color: T.textDim, fontWeight: 500, fontFamily: T.mono }}>Solo</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', marginBottom: 14,
          background: T.bg2, borderRadius: 6, border: `1px solid ${T.border}` }}>
          {Icon.search(13, T.textDim)}
          <span style={{ fontSize: 12, color: T.textDim, flex: 1 }}>Cari…</span>
          <span style={{ fontSize: 10.5, color: T.textMute, fontFamily: T.mono, padding: '1px 5px',
            background: T.bg3, borderRadius: 3 }}>⌘K</span>
        </div>

        <SideSection label="Menu Utama">
          <SideItem icon={Icon.home(15)} label="Beranda" active />
          <SideItem icon={Icon.clipboard(15)} label="Checklist" badge="3" />
          <SideItem icon={Icon.truck(15)} label="Resi Online" badge="12" />
          <SideItem icon={Icon.bag(15)} label="Pesanan" />
          <SideItem icon={Icon.user(15)} label="Profil" />
        </SideSection>

        <SideSection label="Owner">
          <SideItem icon={Icon.users(15)} label="Karyawan" />
          <SideItem icon={Icon.wallet(15)} label="Gaji" />
          <SideItem icon={Icon.shield(15)} label="Verifikasi" badge="7" badgeSage />
        </SideSection>

        <div style={{ flex: 1 }} />

        <div style={{ padding: '10px 8px', borderTop: `1px solid ${T.border}`, marginTop: 12,
          display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: T.sageDark,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 600, fontSize: 11, fontFamily: T.mono }}>HR</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>H. Rahmat</div>
            <div style={{ fontSize: 10.5, color: T.textDim, fontWeight: 500, fontFamily: T.mono }}>Owner</div>
          </div>
          {Icon.logout(13)}
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.textDim, fontWeight: 500 }}>
            <span>Beranda</span>
            <span style={{ color: T.textMute }}>/</span>
            <span style={{ color: T.text, fontWeight: 600 }}>Dashboard Owner</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
              border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 12, color: T.textSec, fontWeight: 500, background: T.surface }}>
              Senin, 4 Mei 2026 <span style={{ color: T.textMute }}>▾</span>
            </div>
            <button style={btnIcon}>{Icon.bell(15)}</button>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6,
              background: T.sage, color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
              {Icon.plus(12)} Buat Tugas
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
          {/* Heading */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: T.textDim, fontWeight: 600, fontFamily: T.mono, letterSpacing: 0.4, textTransform: 'uppercase' }}>Cabang Solo</div>
              <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, letterSpacing: -0.5, color: T.text }}>Selamat pagi, H. Rahmat</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <FilterChip label="Hari ini" active />
              <FilterChip label="Minggu ini" />
              <FilterChip label="Bulan ini" />
            </div>
          </div>

          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
            <DKPI label="Karyawan Aktif" value="6" sub="dari 7 terdaftar" />
            <DKPI label="Checklist Selesai" value="38/60" sub="63% rate" prog={38/60} />
            <DKPI label="Resi Hari Ini" value="48" sub="↑ 12 dari kemarin" trendUp />
            <DKPI label="Pesanan Pending" value="9" sub="3 prioritas tinggi" />
          </div>

          {/* Two column */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 12 }}>
            {/* Karyawan table */}
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${T.border}` }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text }}>Progres Karyawan</div>
                  <div style={{ fontSize: 11.5, color: T.textDim, fontWeight: 500, marginTop: 1 }}>Hari ini · 6 karyawan</div>
                </div>
                <div style={{ fontSize: 11.5, color: T.sage, fontWeight: 500 }}>Lihat semua →</div>
              </div>
              {/* Table head */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 80px 90px',
                gap: 12, padding: '8px 16px',
                fontSize: 10, color: T.textDim, fontWeight: 600, fontFamily: T.mono, letterSpacing: 0.4, textTransform: 'uppercase',
                borderBottom: `1px solid ${T.border}`, background: T.bg2 }}>
                <div>Nama</div>
                <div>Progres</div>
                <div style={{ textAlign: 'right' }}>Poin</div>
                <div style={{ textAlign: 'right' }}>Status</div>
              </div>
              {[
                { n: 'Fajar Alamsyah', i: 'FA', d: 7, t: 10, p: 184, s: 'on-track' },
                { n: 'Siti Maryam', i: 'SM', d: 9, t: 10, p: 212, s: 'top' },
                { n: 'Bayu Pratama', i: 'BP', d: 5, t: 10, p: 142, s: 'on-track' },
                { n: 'Ningsih Aulia', i: 'NA', d: 4, t: 10, p: 96, s: 'low' },
                { n: 'Rizky Hakim', i: 'RH', d: 8, t: 10, p: 168, s: 'on-track' },
                { n: 'Dewi Lestari', i: 'DL', d: 6, t: 10, p: 124, s: 'on-track' },
              ].map((e, i, arr) => <EmpRow key={i} {...e} last={i === arr.length - 1} />)}
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Verifikasi */}
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: `1px solid ${T.border}` }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text }}>Menunggu Verifikasi</div>
                    <div style={{ fontSize: 11, color: T.textDim, fontWeight: 500, marginTop: 1 }}>Disetujui akan menambah poin karyawan</div>
                  </div>
                  <span style={{ minWidth: 22, height: 22, padding: '0 7px', borderRadius: 4, fontSize: 11, fontWeight: 600, fontFamily: T.mono,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: T.sage, color: '#fff' }}>7</span>
                </div>
                {[
                  { n: 'Siti M.', i: 'SM', t: 'Bersihkan etalase kaca', time: '10m' },
                  { n: 'Bayu P.', i: 'BP', t: 'Update display buku baru', time: '23m' },
                  { n: 'Fajar A.', i: 'FA', t: 'Input stok masuk pagi', time: '1j' },
                ].map((v, i, arr) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${T.border}` }}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: T.sage, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 600, fontFamily: T.mono }}>{v.i}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.t}</div>
                      <div style={{ fontSize: 10.5, color: T.textDim, fontWeight: 500, fontFamily: T.mono }}>{v.n} · {v.time}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 5, background: T.sage,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>{Icon.check(11, '#fff')}</div>
                      <div style={{ width: 24, height: 24, borderRadius: 5, background: T.bg2, border: `1px solid ${T.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>{Icon.x(10, T.red)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stok rendah */}
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text }}>Stok Rendah</div>
                  <div style={{ fontSize: 11.5, color: T.sage, fontWeight: 500 }}>Pesan ulang</div>
                </div>
                {[
                  { t: 'Riyadhus Shalihin', a: 'Imam An-Nawawi', s: 2 },
                  { t: 'Tafsir Ibnu Katsir Jilid 3', a: 'Pustaka Imam Asy-Syafii', s: 1 },
                  { t: 'Bulughul Maram', a: 'Ibnu Hajar', s: 4 },
                ].map((b, i, arr) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${T.border}` }}>
                    <div style={{ width: 26, height: 32, borderRadius: 3, background: T.sage }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.t}</div>
                      <div style={{ fontSize: 10.5, color: T.textDim, fontWeight: 500 }}>{b.a}</div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, fontFamily: T.mono,
                      color: b.s <= 2 ? T.red : T.amber,
                      padding: '2px 7px', borderRadius: 4,
                      background: b.s <= 2 ? T.redSoft : T.amberSoft }}>{b.s} kiri</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, active }) {
  return (
    <div style={{
      padding: '5px 11px', borderRadius: 6, fontSize: 12, fontWeight: 500,
      background: active ? T.surface : 'transparent',
      border: `1px solid ${active ? T.borderHi : 'transparent'}`,
      color: active ? T.text : T.textDim,
      cursor: 'pointer',
    }}>{label}</div>
  );
}

function DKPI({ label, value, sub, prog, trendUp }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 10, color: T.textDim, fontWeight: 600, fontFamily: T.mono, letterSpacing: 0.4, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, color: T.text, letterSpacing: -0.7, fontFamily: T.mono, marginTop: 8, lineHeight: 1 }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
        {trendUp && Icon.trend(11, T.sage)}
        <div style={{ fontSize: 11, color: T.textSec, fontWeight: 500 }}>{sub}</div>
      </div>
      {prog !== undefined && (
        <div style={{ height: 3, borderRadius: 99, background: T.bg3, marginTop: 10, overflow: 'hidden' }}>
          <div style={{ width: `${prog * 100}%`, height: '100%', background: T.sage }} />
        </div>
      )}
    </div>
  );
}

function EmpRow({ n, i, d, t, p, s, last }) {
  const pct = d / t;
  const sLabel = s === 'top' ? 'Top' : s === 'low' ? 'Perlu perhatian' : 'On track';
  const sColor = s === 'top' ? T.sage : s === 'low' ? T.red : T.amber;
  const sBg = s === 'top' ? T.sageSoft : s === 'low' ? T.redSoft : T.amberSoft;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 80px 90px',
      gap: 12, padding: '10px 16px', alignItems: 'center',
      borderBottom: last ? 'none' : `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div style={{ width: 26, height: 26, borderRadius: 6, background: T.sage,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 600, fontSize: 10.5, fontFamily: T.mono }}>{i}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n}</div>
      </div>
      <div>
        <div style={{ height: 5, borderRadius: 99, background: T.bg3, overflow: 'hidden' }}>
          <div style={{ width: `${pct * 100}%`, height: '100%', background: T.sage }} />
        </div>
        <div style={{ fontSize: 10.5, color: T.textDim, marginTop: 4, fontWeight: 500, fontFamily: T.mono }}>{d}/{t} tugas</div>
      </div>
      <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 600, color: T.text, fontFamily: T.mono }}>{p}</div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ display: 'inline-block', padding: '2px 7px', borderRadius: 4,
          background: sBg, color: sColor, fontSize: 10.5, fontWeight: 600, fontFamily: T.mono, letterSpacing: 0.2 }}>{sLabel}</span>
      </div>
    </div>
  );
}

function SideSection({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, color: T.textDim, fontWeight: 600, fontFamily: T.mono,
        letterSpacing: 0.5, textTransform: 'uppercase', padding: '4px 8px 6px' }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>{children}</div>
    </div>
  );
}

function SideItem({ icon, label, active, badge, badgeSage }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 8px',
      borderRadius: 5, cursor: 'pointer',
      background: active ? T.sageSoft : 'transparent' }}>
      <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {React.cloneElement(icon, { stroke: active ? T.sage : T.textSec })}
      </div>
      <span style={{ flex: 1, fontSize: 12.5, fontWeight: active ? 600 : 500,
        color: active ? T.sage : T.text, letterSpacing: -0.05 }}>{label}</span>
      {badge && (
        <span style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 3, fontSize: 10, fontWeight: 600, fontFamily: T.mono,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: badgeSage ? T.sage : T.bg3,
          color: badgeSage ? '#fff' : T.textSec }}>{badge}</span>
      )}
    </div>
  );
}

Object.assign(window, { DashboardScreen, ChecklistScreen, ProfileScreen, DesktopApp });
