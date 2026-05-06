function Skeleton({ className }: { className: string }) {
  return <div className={`rounded-[6px] bg-bg3 ${className}`} />;
}

export default function GajiLoading() {
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
        <Skeleton className="h-3 w-40" />
      </div>

      {/* Month navigator */}
      <div className="mx-5 mb-4 flex items-center justify-between rounded-[10px] border border-border bg-surface px-4 py-3">
        <Skeleton className="h-8 w-8 rounded-[8px]" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-8 rounded-[8px]" />
      </div>

      {/* Input form */}
      <div className="mx-5 mb-4 rounded-[10px] border border-border bg-surface p-4">
        <Skeleton className="mb-3 h-3 w-24" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full rounded-[8px]" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 rounded-[8px]" />
            <Skeleton className="h-10 rounded-[8px]" />
          </div>
          <Skeleton className="h-10 w-full rounded-[8px]" />
          <Skeleton className="h-10 w-full rounded-[8px]" />
        </div>
      </div>

      {/* Gaji rows */}
      <div className="px-5">
        <Skeleton className="mb-2.5 h-2.5 w-28" />
        <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
          {[0, 1, 2].map((i) => (
            <div key={i} className="px-4 py-3.5" style={{ borderBottom: i < 2 ? "1px solid #E8E3D8" : "none" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-[8px]" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                </div>
                <Skeleton className="h-7 w-20 rounded-[6px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
