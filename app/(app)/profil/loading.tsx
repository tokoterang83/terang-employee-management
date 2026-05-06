function Skeleton({ className }: { className: string }) {
  return <div className={`rounded-[6px] bg-bg3 ${className}`} />;
}

export default function ProfilLoading() {
  return (
    <div className="flex animate-pulse flex-col pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <Skeleton className="h-8 w-8 rounded-[8px]" />
        <Skeleton className="h-3.5 w-16" />
        <div className="h-8 w-8" />
      </div>

      {/* Avatar + nama */}
      <div className="flex flex-col items-center px-5 pb-4 pt-6 gap-3">
        <Skeleton className="h-16 w-16 rounded-[14px]" />
        <div className="flex flex-col items-center gap-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Total poin card */}
      <div className="mx-5 rounded-[10px] border border-border bg-surface p-4">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="mt-2 h-10 w-20" />
        <Skeleton className="mt-1.5 h-2.5 w-24" />
        <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
      </div>

      {/* Histori poin */}
      <div className="px-5 pt-5">
        <div className="mb-2.5 flex items-center justify-between">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </div>
        <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i < 4 ? "1px solid #E8E3D8" : "none" }}>
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-2.5 w-20" />
              </div>
              <Skeleton className="h-5 w-8 rounded-[4px]" />
            </div>
          ))}
        </div>
      </div>

      {/* Riwayat gaji */}
      <div className="px-5 pt-5">
        <Skeleton className="mb-2.5 h-2.5 w-28" />
        <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: i < 1 ? "1px solid #E8E3D8" : "none" }}>
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2.5 w-32" />
              </div>
              <Skeleton className="h-5 w-16 rounded-[4px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
