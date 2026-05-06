function Skeleton({ className }: { className: string }) {
  return <div className={`rounded-[6px] bg-bg3 ${className}`} />;
}

export default function ChecklistLoading() {
  return (
    <div className="flex animate-pulse flex-col pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <Skeleton className="h-8 w-8 rounded-[8px]" />
        <Skeleton className="h-3.5 w-20" />
        <div className="h-8 w-8" />
      </div>

      {/* Title */}
      <div className="px-5 pb-4 pt-5 flex flex-col gap-2">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>

      {/* Progress card */}
      <div className="mx-5 rounded-[10px] border border-border bg-surface p-4">
        <div className="mb-3 flex items-end justify-between">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-2.5 w-14" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
        <div className="mt-2.5 flex gap-3">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>

      {/* Item list */}
      <div className="mx-5 mt-3 overflow-hidden rounded-[10px] border border-border bg-surface">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < 4 ? "1px solid #E8E3D8" : "none" }}>
            <Skeleton className="h-[18px] w-[18px] flex-shrink-0 rounded-[5px]" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-4 w-6 rounded-[4px]" />
          </div>
        ))}
      </div>
    </div>
  );
}
