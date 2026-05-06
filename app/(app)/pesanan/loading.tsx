function Skeleton({ className }: { className: string }) {
  return <div className={`rounded-[6px] bg-bg3 ${className}`} />;
}

export default function PesananLoading() {
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
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-3 w-36" />
      </div>

      {/* Form card */}
      <div className="mx-5 mb-4 rounded-[10px] border border-border bg-surface p-4">
        <Skeleton className="mb-3 h-3.5 w-32" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-11 w-full rounded-[8px]" />
          <Skeleton className="h-11 w-full rounded-[8px]" />
          <Skeleton className="h-11 w-full rounded-[8px]" />
          <Skeleton className="h-20 w-full rounded-[8px]" />
          <Skeleton className="h-12 w-full rounded-[8px]" />
        </div>
      </div>

      {/* Pesanan list */}
      <div className="px-5">
        <Skeleton className="mb-2.5 h-2.5 w-24" />
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-[10px] border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1.5 flex-1">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
                <div className="flex flex-col gap-1.5 items-end">
                  <Skeleton className="h-5 w-14 rounded-[4px]" />
                  <Skeleton className="h-5 w-14 rounded-[4px]" />
                </div>
              </div>
              <Skeleton className="mt-2 h-8 w-full" />
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <Skeleton className="h-2.5 w-28" />
                <Skeleton className="h-7 w-20 rounded-[7px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
