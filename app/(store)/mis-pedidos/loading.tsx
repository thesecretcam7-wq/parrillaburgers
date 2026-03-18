export default function MisPedidosLoading() {
  return (
    <main className="min-h-screen bg-[#0F1117] px-4 py-4 pb-28">
      <div className="max-w-lg mx-auto space-y-2">
        <div className="h-4 w-48 bg-[#1A1B21] rounded mb-6 animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 bg-[#1A1B21] rounded-2xl p-4 border border-[#2E3038] animate-pulse"
          >
            <div className="w-11 h-11 rounded-xl bg-[#2E3038] shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-[#2E3038] rounded w-28" />
              <div className="h-4 bg-[#2E3038] rounded w-20" />
              <div className="h-3 bg-[#2E3038] rounded w-16" />
            </div>
            <div className="text-right space-y-2">
              <div className="h-4 bg-[#2E3038] rounded w-16" />
              <div className="h-3 bg-[#2E3038] rounded w-4 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
