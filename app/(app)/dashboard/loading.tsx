function Skeleton({ className }: { className: string }) {
  return <div className={`rounded-[6px] bg-bg3 ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="flex animate-pulse flex-col pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-[8px]" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-[8px]" />
      </div>

      {/* Greeting */}
      <div className="px-5 pb-4 pt-6 flex flex-col gap-2">
        <Skeleton className="h-2.5 w-14" />
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-3 w-36" />
      </div>

      {/* Stats 2x2 */}
      <div className="grid grid-cols-2 gap-2 px-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-[10px] border border-border bg-surface p-3.5">
            <Skeleton className="h-2.5 w-14 bg-bg3" />
            <Skeleton className="mt-2.5 h-7 w-12 bg-bg3" />
            <Skeleton className="mt-2 h-2.5 w-20 bg-bg3" />
          </div>
        ))}
      </div>

      {/* Section list */}
      <div className="px-5 pt-6">
        <div className="mb-2.5 flex items-center justify-between">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < 2 ? "1px solid #E8E3D8" : "none" }}>
              <Skeleton className="h-4 w-4 rounded-[4px]" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-4 w-6 rounded-[4px]" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-5 pt-5">
        <Skeleton className="mb-2.5 h-2.5 w-20" />
        <div className="grid grid-cols-2 gap-2">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-[10px] border border-border bg-surface p-3.5">
              <Skeleton className="h-8 w-8 rounded-[7px]" />
              <Skeleton className="mt-2.5 h-3.5 w-20" />
              <Skeleton className="mt-1.5 h-2.5 w-14" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
