function Skeleton({ className }: { className: string }) {
  return <div className={`rounded-[6px] bg-bg3 ${className}`} />;
}

export default function KaryawanLoading() {
  return (
    <div className="flex animate-pulse flex-col pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <Skeleton className="h-8 w-8 rounded-[8px]" />
        <Skeleton className="h-3.5 w-28" />
        <div className="h-8 w-8" />
      </div>

      {/* Title */}
      <div className="px-5 pb-4 pt-5 flex flex-col gap-2">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-3 w-28" />
      </div>

      {/* Karyawan list */}
      <div className="mx-5 overflow-hidden rounded-[10px] border border-border bg-surface">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: i < 2 ? "1px solid #E8E3D8" : "none" }}>
            <Skeleton className="h-10 w-10 flex-shrink-0 rounded-[8px]" />
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-2.5 w-24" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-2.5 w-8" />
            </div>
          </div>
        ))}
      </div>

      {/* Tambah btn */}
      <div className="mx-5 mt-4">
        <Skeleton className="h-12 w-full rounded-[10px]" />
      </div>

      {/* SOP link */}
      <div className="mx-5 mt-3">
        <Skeleton className="h-14 w-full rounded-[10px]" />
      </div>
    </div>
  );
}
