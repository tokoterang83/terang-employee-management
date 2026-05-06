import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-bg px-5 py-12">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-sage">
          <span className="font-mono text-[22px] font-bold tracking-wider text-white">
            T
          </span>
        </div>
        <div className="text-center">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-dim">
            Toko Buku & Kitab
          </p>
          <h1 className="text-[22px] font-semibold tracking-tight text-text">
            Terang
          </h1>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-[390px] rounded-[12px] border border-border bg-surface p-6 shadow-none">
        <div className="mb-6">
          <h2 className="text-[18px] font-semibold text-text">Selamat datang</h2>
          <p className="mt-1 text-[13px] text-text-dim">
            Masuk untuk melanjutkan ke aplikasi
          </p>
        </div>

        <LoginForm />
      </div>

      <p className="mt-6 font-mono text-[10.5px] text-text-mute">
        terang v1.0 · made with ﷽
      </p>
    </div>
  );
}
