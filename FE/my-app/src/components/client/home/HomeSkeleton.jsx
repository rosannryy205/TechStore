/**
 * HomeSkeleton — High-fidelity skeletal shimmer matching exact layout dimensions
 * Complies with Stitch DESIGN.md rule 59 & 121 (no circular spinners, skeletal shimmer only).
 */
export default function HomeSkeleton() {
  return (
    <div className="w-full min-h-[100dvh] bg-[#F9FAFB] py-8 px-4 sm:px-6 lg:px-12 animate-pulse" aria-busy="true" aria-label="Đang tải giao diện">
      <div className="max-w-[1400px] mx-auto space-y-12">
        {/* Hero Skeleton (Asymmetric 50/50) */}
        <div className="min-h-[75dvh] rounded-[2.5rem] bg-[#18181B] p-8 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-white/5">
          <div className="lg:col-span-7 space-y-6">
            <div className="h-6 w-36 rounded-full bg-white/10 animate-shimmer" />
            <div className="h-16 w-4/5 rounded-2xl bg-white/10 animate-shimmer" />
            <div className="h-12 w-3/5 rounded-2xl bg-white/10 animate-shimmer" />
            <div className="h-5 w-2/3 rounded-lg bg-white/10 animate-shimmer" />
            <div className="pt-4 flex gap-4">
              <div className="h-14 w-44 rounded-full bg-[#3B82F6]/40 animate-shimmer" />
            </div>
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-72 h-96 rounded-3xl bg-white/5 border border-white/10 animate-shimmer" />
          </div>
        </div>

        {/* Categories Ribbon Skeleton */}
        <div className="flex items-center justify-center gap-6 py-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-slate-200 animate-shimmer" />
              <div className="w-12 h-3 rounded bg-slate-200 animate-shimmer" />
            </div>
          ))}
        </div>

        {/* Bento Grid Skeleton */}
        <div className="space-y-6">
          <div className="h-8 w-64 rounded-lg bg-slate-200 animate-shimmer" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6 h-96 rounded-[2.5rem] bg-white border border-slate-200/50 p-8 animate-shimmer" />
            <div className="md:col-span-3 h-96 rounded-[2.5rem] bg-white border border-slate-200/50 p-8 animate-shimmer" />
            <div className="md:col-span-3 h-96 rounded-[2.5rem] bg-white border border-slate-200/50 p-8 animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
