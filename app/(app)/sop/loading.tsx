function Skeleton({ className }: { className: string }) {
  return <div className={`rounded-[6px] bg-bg3 ${className}`} />;
}

export default function SopLoading() {
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
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-3 w-36" />
      </div>

      {/* Karyawan selector */}
      <div className="mx-5 mb-4">
        <Skeleton className="h-11 w-full rounded-[10px]" />
      </div>

      {/* SOP templates */}
      <div className="mx-5 flex flex-col gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="overflow-hidden rounded-[10px] border border-border bg-surface">
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #E8E3D8", background: "#F4F1EA" }}>
              <Skeleton className="h-3.5 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-6 rounded-[5px]" />
                <Skeleton className="h-6 w-6 rounded-[5px]" />
              </div>
            </div>
            {[0, 1, 2].map((j) => (
              <div key={j} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: j < 2 ? "1px solid #E8E3D8" : "none" }}>
                <Skeleton className="h-4 w-4 rounded-[4px]" />
                <Skeleton className="h-2.5 flex-1" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
