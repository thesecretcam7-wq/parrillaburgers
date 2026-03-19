export default function CartLoading() {
  return (
    <main className="min-h-screen bg-[#0F1117] px-4 py-4">
      <div className="max-w-lg mx-auto space-y-3">

        {/* Items skeleton */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-[#1A1B21] rounded-2xl p-4 flex items-center gap-3 border border-[#2E3038] animate-pulse"
          >
            <div className="w-14 h-14 rounded-xl bg-[#2E3038] shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-[#2E3038] rounded w-3/4" />
              <div className="h-3 bg-[#2E3038] rounded w-1/3" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#2E3038]" />
              <div className="w-5 h-4 bg-[#2E3038] rounded" />
              <div className="w-7 h-7 rounded-full bg-[#2E3038]" />
            </div>
            <div className="min-w-[70px] space-y-1.5 text-right">
              <div className="h-3.5 bg-[#2E3038] rounded w-16 ml-auto" />
              <div className="h-3 bg-[#2E3038] rounded w-6 ml-auto" />
            </div>
          </div>
        ))}

        {/* Summary skeleton */}
        <div className="bg-[#1A1B21] rounded-2xl p-5 border border-[#2E3038] animate-pulse space-y-4">
          <div className="h-4 bg-[#2E3038] rounded w-40" />
          <div className="space-y-2.5">
            <div className="flex justify-between">
              <div className="h-3 bg-[#2E3038] rounded w-20" />
              <div className="h-3 bg-[#2E3038] rounded w-16" />
            </div>
            <div className="flex justify-between">
              <div className="h-3 bg-[#2E3038] rounded w-16" />
              <div className="h-3 bg-[#2E3038] rounded w-14" />
            </div>
            <div className="border-t border-[#2E3038] pt-2.5 flex justify-between">
              <div className="h-4 bg-[#2E3038] rounded w-12" />
              <div className="h-4 bg-[#2E3038] rounded w-20" />
            </div>
          </div>
          <div className="h-10 bg-[#2E3038] rounded-xl" />
          <div className="h-12 bg-[#D4A017]/20 rounded-xl" />
        </div>

      </div>
    </main>
  );
}
