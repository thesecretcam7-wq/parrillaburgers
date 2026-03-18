export default function MenuLoading() {
  return (
    <main className="min-h-screen bg-[#0F1117]">
      <div className="max-w-5xl mx-auto px-3 pb-24">
        {/* Banner skeleton */}
        <div className="mt-3 h-11 bg-[#1A1B21] rounded-2xl mb-4 animate-pulse" />

        {/* Search bar skeleton */}
        <div className="mb-5 h-10 bg-[#1A1B21] rounded-xl animate-pulse" />

        <div className="h-5 w-40 bg-[#1A1B21] rounded mb-3 animate-pulse" />

        {/* Category cards skeleton */}
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-full bg-[#1A1B21] border border-[#2E3038] rounded-2xl px-5 py-4 flex items-center gap-4 animate-pulse"
            >
              <div className="w-10 h-10 rounded-xl bg-[#2E3038] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#2E3038] rounded w-32" />
                <div className="h-3 bg-[#2E3038] rounded w-20" />
              </div>
              <div className="w-5 h-5 bg-[#2E3038] rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
