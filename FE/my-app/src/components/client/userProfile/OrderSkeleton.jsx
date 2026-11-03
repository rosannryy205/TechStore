export default function OrderSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-label="Đang tải danh sách đơn hàng...">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="bg-white rounded-[24px] border border-zinc-200/80 p-6 sm:p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] animate-pulse"
        >
          {/* Header row: Order code, date, status badge */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-5 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="h-5 w-32 bg-zinc-200/80 rounded-md" />
              <div className="h-4 w-24 bg-zinc-100 rounded-md" />
            </div>
            <div className="h-7 w-28 bg-zinc-100 rounded-full" />
          </div>

          {/* Stepper bar skeleton */}
          <div className="py-6 border-b border-zinc-100">
            <div className="flex items-center justify-between gap-2 max-w-xl mx-auto">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-7 h-7 rounded-full bg-zinc-200/70" />
                  <div className="h-3 w-16 bg-zinc-100 rounded-md hidden sm:block" />
                </div>
              ))}
            </div>
          </div>

          {/* Item rows */}
          <div className="py-5 space-y-4 border-b border-zinc-100">
            {[1, 2].map((item) => (
              <div key={item} className="flex justify-between items-center gap-4">
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-48 bg-zinc-200/70 rounded-md" />
                  <div className="h-3 w-32 bg-zinc-100 rounded-md" />
                </div>
                <div className="space-y-1 text-right">
                  <div className="h-4 w-20 bg-zinc-200/70 rounded-md ml-auto" />
                  <div className="h-3 w-12 bg-zinc-100 rounded-md ml-auto" />
                </div>
              </div>
            ))}
          </div>

          {/* Footer row: Total and action buttons */}
          <div className="pt-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex items-baseline gap-2">
              <div className="h-4 w-16 bg-zinc-100 rounded-md" />
              <div className="h-6 w-28 bg-zinc-200/80 rounded-md" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-24 bg-zinc-100 rounded-full" />
              <div className="h-10 w-28 bg-zinc-200/80 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
