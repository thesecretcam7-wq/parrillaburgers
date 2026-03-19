export default function HomeLoading() {
  return (
    <main className="h-[100dvh] bg-[#0F1117] flex flex-col items-center justify-between px-6 py-8 overflow-hidden">

      {/* Logo skeleton */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-56 h-[30dvh] bg-[#1A1B21] rounded-2xl animate-pulse" />
      </div>

      {/* Banner skeleton */}
      <div className="w-full max-w-xs h-44 bg-[#1A1B21] rounded-2xl animate-pulse shrink-0" />

      {/* Bottom section skeleton */}
      <div className="w-full max-w-xs flex flex-col items-center gap-4 shrink-0 mt-4">
        <div className="w-48 h-4 bg-[#1A1B21] rounded-full animate-pulse" />
        <div className="flex gap-2">
          {[80, 72, 96].map((w, i) => (
            <div key={i} className="h-7 bg-[#1A1B21] rounded-full animate-pulse" style={{ width: w }} />
          ))}
        </div>
        <div className="w-full h-14 bg-[#1A1B21] rounded-2xl animate-pulse" />
      </div>

    </main>
  );
}
