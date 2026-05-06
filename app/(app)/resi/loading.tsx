function Skeleton({ className }: { className: string }) {
  return <div className={`rounded-[6px] bg-bg3 ${className}`} />;
}

export default function ResiLoading() {
  return (
    <div className="flex animate-pulse flex-col pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <Skeleton className="h-8 w-8 rounded-[8px]" />
        <Skeleton className="h-3.5 w-24" />
        <div className="h-8 w-8" />
      </div>

      {/* Title */}
      <div className="px-5 pb-4 pt-5 flex flex-col gap-2">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>

      {/* Status 4 tiles */}
      <div className="grid grid-cols-4 gap-1.5 px-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-[8px] border border-border bg-surface p-2.5 text-center flex flex-col items-center gap-1.5">
            <Skeleton className="h-5 w-6" />
            <Skeleton className="h-2 w-10" />
          </div>
        ))}
      </div>

      {/* Upload form area */}
      <div className="mx-5 mt-4 rounded-[10px] border border-border bg-surface p-4">
        <Skeleton className="mb-3 h-3.5 w-28" />
        <Skeleton className="h-24 w-full rounded-[8px]" />
        <div className="mt-3 flex flex-col gap-1.5">
          <Skeleton className="h-2.5 w-32" />
          <Skeleton className="h-11 w-full rounded-[8px]" />
        </div>
        <Skeleton className="mt-3 h-12 w-full rounded-[8px]" />
      </div>

      {/* Resi list */}
      <div className="px-5 pt-4">
        <Skeleton className="mb-2.5 h-2.5 w-20" />
        <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < 2 ? "1px solid #E8E3D8" : "none" }}>
              <div className="flex-1 flex flex-col gap-1.5">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-2.5 w-28" />
              </div>
              <Skeleton className="h-5 w-16 rounded-[4px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
