"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/types";

const karyawanItems = [
  {
    id: "dashboard",
    href: "/dashboard",
    label: "Beranda",
    icon: HomeIcon,
  },
  {
    id: "checklist",
    href: "/checklist",
    label: "Checklist",
    icon: ClipboardIcon,
  },
  {
    id: "pesanan",
    href: "/pesanan",
    label: "Pesanan",
    icon: BagIcon,
  },
  {
    id: "resi",
    href: "/resi",
    label: "Resi",
    icon: TruckIcon,
  },
  {
    id: "profil",
    href: "/profil",
    label: "Profil",
    icon: UserIcon,
  },
];

const ownerItems = [
  {
    id: "dashboard",
    href: "/dashboard",
    label: "Beranda",
    icon: HomeIcon,
  },
  {
    id: "checklist",
    href: "/checklist",
    label: "Verifikasi",
    icon: ClipboardIcon,
  },
  {
    id: "pesanan",
    href: "/pesanan",
    label: "Pesanan",
    icon: BagIcon,
  },
  {
    id: "resi",
    href: "/resi",
    label: "Resi",
    icon: TruckIcon,
  },
  {
    id: "karyawan",
    href: "/karyawan",
    label: "Anggota",
    icon: UsersIcon,
  },
];

export function BottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = role === "owner" ? ownerItems : karyawanItems;

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <div className="px-4 pb-2 pt-0">
      <nav className="flex items-center justify-around rounded-[14px] border border-border bg-surface px-1 py-2">
        {items.map((item) => {
          const active = isActive(item.href);
          const IconComp = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex min-w-[52px] flex-col items-center gap-1 rounded-[10px] px-2 py-1.5 transition-colors"
              style={{
                background: active ? "#E8EBE5" : "transparent",
              }}
            >
              <IconComp active={active} />
              <span
                className="text-[10px] font-semibold"
                style={{ color: active ? "#586D57" : "#8B887D" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? "#586D57" : "#8B887D";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z" />
    </svg>
  );
}

function ClipboardIcon({ active }: { active: boolean }) {
  const c = active ? "#586D57" : "#8B887D";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4h6v3H9z" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}

function TruckIcon({ active }: { active: boolean }) {
  const c = active ? "#586D57" : "#8B887D";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7h11v10H2zM13 10h5l3 3v4h-8z" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

function BagIcon({ active }: { active: boolean }) {
  const c = active ? "#586D57" : "#8B887D";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8h14l-1 12H6L5 8z" />
      <path d="M9 8V6a3 3 0 016 0v2" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  const c = active ? "#586D57" : "#8B887D";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  );
}

function UsersIcon({ active }: { active: boolean }) {
  const c = active ? "#586D57" : "#8B887D";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="3.5" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M3 19c0-3 3-5 6-5s6 2 6 5" />
      <path d="M15 19c0-2.5 1-3.5 3-3.5s3 1 3 3" />
    </svg>
  );
}
